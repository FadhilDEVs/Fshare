/**
 * Fshare - Digital Daily-Recording App
 * Backend: code.gs (Mode B - GitHub Pages JSON API + CORS)
 */

var SHEET_USERS = 'Users';
var SHEET_KEUANGAN = 'Keuangan';
var SHEET_KATEGORI_TUGAS = 'Kategori_Tugas';
var SHEET_TUGAS_KULIAH = 'Tugas_Kuliah';
var SHEET_REKAP_SHOLAT = 'Rekap_Sholat';

/**
 * Mendapatkan referensi Spreadsheet aktif atau via PropertiesService
 */
function getSpreadsheet_() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  throw new Error('Spreadsheet tidak ditemukan. Buat script dari Spreadsheet (Extensions > Apps Script) atau isi Script Property SPREADSHEET_ID.');
}

/**
 * HTTP Handlers untuk Mode B (JSON API dengan CORS)
 */
function doGet(e) {
  return handleRequest_(e);
}

function doPost(e) {
  return handleRequest_(e);
}

function handleRequest_(e) {
  var out;
  try {
    var req = parseRequest_(e);
    out = routeAction_(req);
  } catch (err) {
    out = { ok: false, message: String(err && err.message || err) };
  }
  return jsonOut_(out, e);
}

function parseRequest_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // Fallback text parsing
    }
  }
  var p = (e && e.parameter) || {};
  var payload = {};
  if (p.payload) {
    try {
      payload = JSON.parse(p.payload);
    } catch (err) {
      payload = p.payload;
    }
  }
  return {
    action: p.action,
    payload: payload
  };
}

function jsonOut_(obj, e) {
  var text = JSON.stringify(obj);
  var cb = e && e.parameter && e.parameter.callback;
  if (cb && /^[A-Za-z_$][\w$.]*$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + text + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Router whitelist action
 */
function routeAction_(req) {
  var action = req.action;
  var payload = req.payload || {};

  switch (action) {
    case 'authRegister':
      return authRegister(payload.username, payload.password);
    case 'authLogin':
      return authLogin(payload.username, payload.password);
    case 'getDashboardSummary':
      return getDashboardSummary(payload.userId, payload.clientMonthYear);
    case 'getKeuangan':
      return getKeuangan(payload.userId, payload.filterType, payload.filterMonth);
    case 'addKeuangan':
      return addKeuangan(payload.userId, payload.form);
    case 'deleteKeuangan':
      return deleteKeuangan(payload.userId, payload.transaksiId);
    case 'getKategoriTugas':
      return getKategoriTugas(payload.userId);
    case 'addKategoriTugas':
      return addKategoriTugas(payload.userId, payload.namaKategori, payload.warna);
    case 'deleteKategoriTugas':
      return deleteKategoriTugas(payload.userId, payload.kategoriId);
    case 'getTugasKuliah':
      return getTugasKuliah(payload.userId, payload.statusFilter);
    case 'addTugasKuliah':
      return addTugasKuliah(payload.userId, payload.form);
    case 'updateStatusTugas':
      return updateStatusTugas(payload.userId, payload.tugasId, payload.status);
    case 'deleteTugasKuliah':
      return deleteTugasKuliah(payload.userId, payload.tugasId);
    case 'getSholatToday':
      return getSholatToday(payload.userId, payload.clientDate);
    case 'toggleSholat':
      return toggleSholat(payload.userId, payload.clientDate, payload.prayerKey, payload.isChecked);
    case 'getSholatSummary':
      return getSholatSummary(payload.userId, payload.filterMonth);
    default:
      return { ok: false, message: 'Action tidak dikenal: ' + action };
  }
}

/**
 * Helper membuat ID unik
 */
function generateId_(prefix) {
  return (prefix || 'ID-') + new Date().getTime().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

/**
 * Format tanggal ke YYYY-MM-DD
 */
function formatDateISO_(d) {
  if (!d) return '';
  var dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  var y = dt.getFullYear();
  var m = ('0' + (dt.getMonth() + 1)).slice(-2);
  var day = ('0' + dt.getDate()).slice(-2);
  return y + '-' + m + '-' + day;
}

/**
 * Format waktu lengkap YYYY-MM-DD HH:mm:ss
 */
function formatDateTimeISO_(d) {
  if (!d) return '';
  var dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  var y = dt.getFullYear();
  var m = ('0' + (dt.getMonth() + 1)).slice(-2);
  var day = ('0' + dt.getDate()).slice(-2);
  var hr = ('0' + dt.getHours()).slice(-2);
  var min = ('0' + dt.getMinutes()).slice(-2);
  var sec = ('0' + dt.getSeconds()).slice(-2);
  return y + '-' + m + '-' + day + ' ' + hr + ':' + min + ':' + sec;
}

// ==========================================
// 1. AUTENTIKASI PENGGUNA (Password Plain Text)
// ==========================================

function authRegister(username, password) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    username = String(username || '').trim();
    password = String(password || '').trim();
    if (!username || username.length < 3) {
      return { ok: false, message: 'Username minimal 3 karakter' };
    }
    if (!password || password.length < 3) {
      return { ok: false, message: 'Password minimal 3 karakter' };
    }

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_USERS);
    if (!sheet) throw new Error('Sheet Users belum disiapkan. Jalankan setup database terlebih dahulu.');

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]).toLowerCase() === username.toLowerCase()) {
        return { ok: false, message: 'Username sudah digunakan' };
      }
    }

    var userId = generateId_('U-');
    var nowStr = formatDateTimeISO_(new Date());

    // Password disimpan apa adanya (plain text) sesuai instruksi user
    sheet.appendRow([userId, username, password, nowStr]);

    return {
      ok: true,
      data: {
        userId: userId,
        username: username
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

function authLogin(username, password) {
  try {
    username = String(username || '').trim();
    password = String(password || '').trim();
    if (!username || !password) {
      return { ok: false, message: 'Username dan Password wajib diisi' };
    }

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_USERS);
    if (!sheet) throw new Error('Sheet Users belum ada. Jalankan setup database.');

    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      var rowUser = String(data[i][1]).trim();
      var rowPass = String(data[i][2]).trim();
      if (rowUser.toLowerCase() === username.toLowerCase()) {
        // Cek password asli (plain text)
        if (rowPass === password) {
          return {
            ok: true,
            data: {
              userId: String(data[i][0]),
              username: rowUser
            }
          };
        } else {
          return { ok: false, message: 'Password salah' };
        }
      }
    }

    return { ok: false, message: 'Username tidak ditemukan' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ==========================================
// 2. BERANDA / DASHBOARD SUMMARY
// ==========================================

function getDashboardSummary(userId, clientMonthYear) {
  try {
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var now = new Date();
    var currentYear = now.getFullYear();
    var currentMonth = ('0' + (now.getMonth() + 1)).slice(-2);
    var targetMonthYear = clientMonthYear || (currentYear + '-' + currentMonth);

    var ss = getSpreadsheet_();

    // 1. Keuangan
    var totalPemasukan = 0;
    var totalPengeluaran = 0;
    var shKeuangan = ss.getSheetByName(SHEET_KEUANGAN);
    if (shKeuangan && shKeuangan.getLastRow() > 1) {
      var dataK = shKeuangan.getDataRange().getValues();
      for (var i = 1; i < dataK.length; i++) {
        if (String(dataK[i][1]) === userId) {
          var tgl = formatDateISO_(dataK[i][2]);
          if (tgl.indexOf(targetMonthYear) === 0) {
            var tipe = String(dataK[i][3]).trim();
            var jml = Number(dataK[i][6]) || 0;
            if (tipe === 'Pemasukan') totalPemasukan += jml;
            else if (tipe === 'Pengeluaran') totalPengeluaran += jml;
          }
        }
      }
    }

    // 2. Tugas Kuliah Aktif
    var tugasAktifCount = 0;
    var shTugas = ss.getSheetByName(SHEET_TUGAS_KULIAH);
    var upcomingTasks = [];
    if (shTugas && shTugas.getLastRow() > 1) {
      var dataT = shTugas.getDataRange().getValues();
      for (var j = 1; j < dataT.length; j++) {
        if (String(dataT[j][1]) === userId) {
          var status = String(dataT[j][7]).trim();
          if (status !== 'Selesai') {
            tugasAktifCount++;
            if (upcomingTasks.length < 5) {
              upcomingTasks.push({
                tugasId: String(dataT[j][0]),
                kategoriId: String(dataT[j][2]),
                namaKategori: String(dataT[j][3]),
                judulTugas: String(dataT[j][4]),
                keterangan: String(dataT[j][5]),
                deadline: formatDateISO_(dataT[j][6]),
                status: status
              });
            }
          }
        }
      }
    }

    // 3. Sholat Hari Ini
    var todayStr = formatDateISO_(now);
    var sholatCompletedCount = 0;
    var shSholat = ss.getSheetByName(SHEET_REKAP_SHOLAT);
    var todaySholat = { subuh: false, zuhur: false, ashar: false, maghrib: false, isya: false };
    if (shSholat && shSholat.getLastRow() > 1) {
      var dataS = shSholat.getDataRange().getValues();
      for (var k = 1; k < dataS.length; k++) {
        if (String(dataS[k][1]) === userId && formatDateISO_(dataS[k][2]) === todayStr) {
          todaySholat.subuh = Boolean(dataS[k][3]);
          todaySholat.zuhur = Boolean(dataS[k][4]);
          todaySholat.ashar = Boolean(dataS[k][5]);
          todaySholat.maghrib = Boolean(dataS[k][6]);
          todaySholat.isya = Boolean(dataS[k][7]);
          sholatCompletedCount = Number(dataS[k][8]) || 0;
          break;
        }
      }
    }

    return {
      ok: true,
      data: {
        totalPemasukan: totalPemasukan,
        totalPengeluaran: totalPengeluaran,
        sisaSaldo: totalPemasukan - totalPengeluaran,
        tugasAktifCount: tugasAktifCount,
        sholatCompletedCount: sholatCompletedCount,
        todaySholat: todaySholat,
        upcomingTasks: upcomingTasks,
        targetMonthYear: targetMonthYear
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ==========================================
// 3. FITUR KEUANGAN
// ==========================================

function getKeuangan(userId, filterType, filterMonth) {
  try {
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_KEUANGAN);
    if (!sheet || sheet.getLastRow() <= 1) {
      return { ok: true, data: { list: [], summary: { pemasukan: 0, pengeluaran: 0, saldo: 0 } } };
    }

    var data = sheet.getDataRange().getValues();
    var list = [];
    var totalPemasukan = 0;
    var totalPengeluaran = 0;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === userId) {
        var tgl = formatDateISO_(data[i][2]);
        var tipe = String(data[i][3]).trim();
        var kat = String(data[i][4]).trim();
        var ket = String(data[i][5]).trim();
        var jml = Number(data[i][6]) || 0;

        if (filterMonth && tgl.indexOf(filterMonth) !== 0) {
          continue;
        }

        if (tipe === 'Pemasukan') totalPemasukan += jml;
        else if (tipe === 'Pengeluaran') totalPengeluaran += jml;

        if (filterType && filterType !== 'Semua' && tipe !== filterType) {
          continue;
        }

        list.push({
          transaksiId: String(data[i][0]),
          tanggal: tgl,
          tipe: tipe,
          kategori: kat,
          keterangan: ket,
          jumlah: jml
        });
      }
    }

    list.sort(function(a, b) {
      return (b.tanggal + b.transaksiId).localeCompare(a.tanggal + a.transaksiId);
    });

    return {
      ok: true,
      data: {
        list: list,
        summary: {
          pemasukan: totalPemasukan,
          pengeluaran: totalPengeluaran,
          saldo: totalPemasukan - totalPengeluaran
        }
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

function addKeuangan(userId, form) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var tanggal = formatDateISO_(form.tanggal || new Date());
    var tipe = String(form.tipe || 'Pengeluaran').trim();
    var kategori = String(form.kategori || 'Umum').trim();
    var keterangan = String(form.keterangan || '').trim();
    var jumlah = Number(form.jumlah) || 0;

    if (!keterangan) return { ok: false, message: 'Keterangan transaksi wajib diisi' };
    if (jumlah <= 0) return { ok: false, message: 'Jumlah harus lebih besar dari 0' };

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_KEUANGAN);
    if (!sheet) throw new Error('Sheet Keuangan belum disiapkan.');

    var trxId = generateId_('TX-');
    var nowStr = formatDateTimeISO_(new Date());

    sheet.appendRow([trxId, userId, tanggal, tipe, kategori, keterangan, jumlah, nowStr]);

    return {
      ok: true,
      data: {
        transaksiId: trxId,
        tanggal: tanggal,
        tipe: tipe,
        kategori: kategori,
        keterangan: keterangan,
        jumlah: jumlah
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

function deleteKeuangan(userId, transaksiId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    userId = String(userId || '').trim();
    transaksiId = String(transaksiId || '').trim();

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_KEUANGAN);
    if (!sheet || sheet.getLastRow() <= 1) return { ok: false, message: 'Data tidak ditemukan' };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === transaksiId && String(data[i][1]) === userId) {
        sheet.deleteRow(i + 1);
        return { ok: true, data: { transaksiId: transaksiId } };
      }
    }

    return { ok: false, message: 'Transaksi tidak ditemukan atau hak akses ditolak' };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 4. FITUR TUGAS KULIAH & KATEGORI
// ==========================================

function getKategoriTugas(userId) {
  try {
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_KATEGORI_TUGAS);
    if (!sheet || sheet.getLastRow() <= 1) return { ok: true, data: [] };

    var shTugas = ss.getSheetByName(SHEET_TUGAS_KULIAH);
    var counts = {};
    if (shTugas && shTugas.getLastRow() > 1) {
      var dTasks = shTugas.getDataRange().getValues();
      for (var t = 1; t < dTasks.length; t++) {
        if (String(dTasks[t][1]) === userId) {
          var kId = String(dTasks[t][2]);
          counts[kId] = (counts[kId] || 0) + 1;
        }
      }
    }

    var data = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === userId) {
        var katId = String(data[i][0]);
        list.push({
          kategoriId: katId,
          namaKategori: String(data[i][2]),
          warna: String(data[i][3] || '#0d9488'),
          taskCount: counts[katId] || 0
        });
      }
    }

    return { ok: true, data: list };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

function addKategoriTugas(userId, namaKategori, warna) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    userId = String(userId || '').trim();
    namaKategori = String(namaKategori || '').trim();
    warna = String(warna || '#0d9488').trim();

    if (!userId) return { ok: false, message: 'UserId tidak valid' };
    if (!namaKategori) return { ok: false, message: 'Nama kategori mata kuliah wajib diisi' };

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_KATEGORI_TUGAS);
    if (!sheet) throw new Error('Sheet Kategori_Tugas belum disiapkan.');

    var katId = generateId_('KAT-');
    var nowStr = formatDateTimeISO_(new Date());

    sheet.appendRow([katId, userId, namaKategori, warna, nowStr]);

    return {
      ok: true,
      data: {
        kategoriId: katId,
        namaKategori: namaKategori,
        warna: warna,
        taskCount: 0
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

function deleteKategoriTugas(userId, kategoriId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    userId = String(userId || '').trim();
    kategoriId = String(kategoriId || '').trim();

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_KATEGORI_TUGAS);
    if (!sheet || sheet.getLastRow() <= 1) return { ok: false, message: 'Kategori tidak ditemukan' };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === kategoriId && String(data[i][1]) === userId) {
        sheet.deleteRow(i + 1);
        return { ok: true, data: { kategoriId: kategoriId } };
      }
    }

    return { ok: false, message: 'Kategori tidak ditemukan' };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

function getTugasKuliah(userId, statusFilter) {
  try {
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_TUGAS_KULIAH);
    if (!sheet || sheet.getLastRow() <= 1) return { ok: true, data: [] };

    var data = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === userId) {
        var status = String(data[i][7] || 'Belum Selesai').trim();
        if (statusFilter && statusFilter !== 'Semua' && status !== statusFilter) {
          continue;
        }
        list.push({
          tugasId: String(data[i][0]),
          kategoriId: String(data[i][2]),
          namaKategori: String(data[i][3]),
          judulTugas: String(data[i][4]),
          keterangan: String(data[i][5]),
          deadline: formatDateISO_(data[i][6]),
          status: status
        });
      }
    }

    list.sort(function(a, b) {
      return a.deadline.localeCompare(b.deadline);
    });

    return { ok: true, data: list };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

function addTugasKuliah(userId, form) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var kategoriId = String(form.kategoriId || '').trim();
    var namaKategori = String(form.namaKategori || '').trim();
    var judulTugas = String(form.judulTugas || '').trim();
    var keterangan = String(form.keterangan || '').trim();
    var deadline = formatDateISO_(form.deadline || new Date());
    var status = 'Belum Selesai';

    if (!judulTugas) return { ok: false, message: 'Judul tugas wajib diisi' };
    if (!deadline) return { ok: false, message: 'Deadline tugas wajib dipilih' };

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_TUGAS_KULIAH);
    if (!sheet) throw new Error('Sheet Tugas_Kuliah belum disiapkan.');

    var tugasId = generateId_('TGS-');
    var nowStr = formatDateTimeISO_(new Date());

    sheet.appendRow([tugasId, userId, kategoriId, namaKategori, judulTugas, keterangan, deadline, status, nowStr]);

    return {
      ok: true,
      data: {
        tugasId: tugasId,
        kategoriId: kategoriId,
        namaKategori: namaKategori,
        judulTugas: judulTugas,
        keterangan: keterangan,
        deadline: deadline,
        status: status
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

function updateStatusTugas(userId, tugasId, status) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    userId = String(userId || '').trim();
    tugasId = String(tugasId || '').trim();
    status = String(status || 'Belum Selesai').trim();

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_TUGAS_KULIAH);
    if (!sheet || sheet.getLastRow() <= 1) return { ok: false, message: 'Tugas tidak ditemukan' };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === tugasId && String(data[i][1]) === userId) {
        sheet.getRange(i + 1, 8).setValue(status);
        return { ok: true, data: { tugasId: tugasId, status: status } };
      }
    }

    return { ok: false, message: 'Tugas tidak ditemukan' };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

function deleteTugasKuliah(userId, tugasId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    userId = String(userId || '').trim();
    tugasId = String(tugasId || '').trim();

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_TUGAS_KULIAH);
    if (!sheet || sheet.getLastRow() <= 1) return { ok: false, message: 'Tugas tidak ditemukan' };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === tugasId && String(data[i][1]) === userId) {
        sheet.deleteRow(i + 1);
        return { ok: true, data: { tugasId: tugasId } };
      }
    }

    return { ok: false, message: 'Tugas tidak ditemukan' };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 5. FITUR SHOLAT 5 WAKTU (Reset 24 Jam)
// ==========================================

function getSholatToday(userId, clientDate) {
  try {
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var targetDate = formatDateISO_(clientDate || new Date());
    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_REKAP_SHOLAT);
    if (!sheet) throw new Error('Sheet Rekap_Sholat belum disiapkan.');

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === userId && formatDateISO_(data[i][2]) === targetDate) {
        return {
          ok: true,
          data: {
            tanggal: targetDate,
            subuh: Boolean(data[i][3]),
            zuhur: Boolean(data[i][4]),
            ashar: Boolean(data[i][5]),
            maghrib: Boolean(data[i][6]),
            isya: Boolean(data[i][7]),
            totalTerlaksana: Number(data[i][8]) || 0
          }
        };
      }
    }

    return {
      ok: true,
      data: {
        tanggal: targetDate,
        subuh: false,
        zuhur: false,
        ashar: false,
        maghrib: false,
        isya: false,
        totalTerlaksana: 0
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

function toggleSholat(userId, clientDate, prayerKey, isChecked) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var targetDate = formatDateISO_(clientDate || new Date());
    prayerKey = String(prayerKey || '').toLowerCase();
    isChecked = Boolean(isChecked);

    var validKeys = ['subuh', 'zuhur', 'ashar', 'maghrib', 'isya'];
    var keyIndex = validKeys.indexOf(prayerKey);
    if (keyIndex === -1) return { ok: false, message: 'Nama sholat tidak valid' };

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_REKAP_SHOLAT);
    if (!sheet) throw new Error('Sheet Rekap_Sholat belum disiapkan.');

    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    var rowValues = [false, false, false, false, false];

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === userId && formatDateISO_(data[i][2]) === targetDate) {
        rowIndex = i + 1;
        rowValues = [
          Boolean(data[i][3]),
          Boolean(data[i][4]),
          Boolean(data[i][5]),
          Boolean(data[i][6]),
          Boolean(data[i][7])
        ];
        break;
      }
    }

    rowValues[keyIndex] = isChecked;
    var totalCount = 0;
    for (var c = 0; c < rowValues.length; c++) {
      if (rowValues[c]) totalCount++;
    }

    var nowStr = formatDateTimeISO_(new Date());

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, keyIndex + 4).setValue(isChecked);
      sheet.getRange(rowIndex, 9).setValue(totalCount);
      sheet.getRange(rowIndex, 10).setValue(nowStr);
    } else {
      var logId = 'SHL-' + targetDate.replace(/-/g, '') + '-' + userId;
      sheet.appendRow([
        logId,
        userId,
        targetDate,
        rowValues[0],
        rowValues[1],
        rowValues[2],
        rowValues[3],
        rowValues[4],
        totalCount,
        nowStr
      ]);
    }

    return {
      ok: true,
      data: {
        tanggal: targetDate,
        subuh: rowValues[0],
        zuhur: rowValues[1],
        ashar: rowValues[2],
        maghrib: rowValues[3],
        isya: rowValues[4],
        totalTerlaksana: totalCount
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

function getSholatSummary(userId, filterMonth) {
  try {
    userId = String(userId || '').trim();
    if (!userId) return { ok: false, message: 'UserId tidak valid' };

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_REKAP_SHOLAT);
    if (!sheet || sheet.getLastRow() <= 1) {
      return { ok: true, data: { list: [], percentage: 0, totalTerlaksana: 0, totalTarget: 0 } };
    }

    var data = sheet.getDataRange().getValues();
    var list = [];
    var totalTerlaksana = 0;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === userId) {
        var tgl = formatDateISO_(data[i][2]);
        if (filterMonth && tgl.indexOf(filterMonth) !== 0) {
          continue;
        }

        var count = Number(data[i][8]) || 0;
        totalTerlaksana += count;

        list.push({
          tanggal: tgl,
          subuh: Boolean(data[i][3]),
          zuhur: Boolean(data[i][4]),
          ashar: Boolean(data[i][5]),
          maghrib: Boolean(data[i][6]),
          isya: Boolean(data[i][7]),
          totalTerlaksana: count
        });
      }
    }

    list.sort(function(a, b) {
      return b.tanggal.localeCompare(a.tanggal);
    });

    var totalTarget = list.length * 5;
    var percentage = totalTarget > 0 ? Math.round((totalTerlaksana / totalTarget) * 100) : 0;

    return {
      ok: true,
      data: {
        list: list,
        totalTerlaksana: totalTerlaksana,
        totalTarget: totalTarget,
        percentage: percentage
      }
    };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
