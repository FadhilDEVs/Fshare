/**
 * Fshare - Digital Daily-Recording App
 * Database & Spreadsheet Setup: setup.gs
 */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Setup Database')
    .addItem('Buat / Perbarui Database', 'setupApp')
    .addItem('Rapikan Spreadsheet', 'rapikanSpreadsheet')
    .addToUi();
}

function getDbSchema_() {
  return {
    'Users': [
      { name: 'user_id', type: 'id' },
      { name: 'username', type: 'text' },
      { name: 'password', type: 'text' },
      { name: 'created_at', type: 'datetime' }
    ],
    'Keuangan': [
      { name: 'transaksi_id', type: 'id' },
      { name: 'user_id', type: 'id' },
      { name: 'tanggal', type: 'date' },
      { name: 'tipe', type: 'text' },
      { name: 'kategori', type: 'text' },
      { name: 'keterangan', type: 'longtext' },
      { name: 'jumlah', type: 'currency' },
      { name: 'created_at', type: 'datetime' }
    ],
    'Kategori_Tugas': [
      { name: 'kategori_id', type: 'id' },
      { name: 'user_id', type: 'id' },
      { name: 'nama_kategori', type: 'text' },
      { name: 'warna', type: 'text' },
      { name: 'created_at', type: 'datetime' }
    ],
    'Tugas_Kuliah': [
      { name: 'tugas_id', type: 'id' },
      { name: 'user_id', type: 'id' },
      { name: 'kategori_id', type: 'id' },
      { name: 'nama_kategori', type: 'text' },
      { name: 'judul_tugas', type: 'text' },
      { name: 'keterangan', type: 'longtext' },
      { name: 'deadline', type: 'date' },
      { name: 'status', type: 'text' },
      { name: 'created_at', type: 'datetime' }
    ],
    'Rekap_Sholat': [
      { name: 'log_id', type: 'id' },
      { name: 'user_id', type: 'id' },
      { name: 'tanggal', type: 'date' },
      { name: 'subuh', type: 'boolean' },
      { name: 'zuhur', type: 'boolean' },
      { name: 'ashar', type: 'boolean' },
      { name: 'maghrib', type: 'boolean' },
      { name: 'isya', type: 'boolean' },
      { name: 'total_terlaksana', type: 'number' },
      { name: 'updated_at', type: 'datetime' }
    ]
  };
}

function setupApp() {
  try {
    var ss = getSpreadsheet_();
    var schema = getDbSchema_();
    var names = Object.keys(schema);
    var lines = [];

    names.forEach(function(name, idx) {
      var cols = schema[name];
      var sh = ss.getSheetByName(name);
      var status = 'SUDAH ADA';
      if (!sh) {
        sh = ss.insertSheet(name);
        status = 'DIBUAT BARU';
      }
      var headers = cols.map(function(c) { return c.name; });
      if (sh.getLastRow() === 0) {
        sh.getRange(1, 1, 1, headers.length).setValues([headers]);
        if (status === 'SUDAH ADA') status = 'HEADER DIISI';
      } else {
        // Cek header baris 1
        var currHeaders = sh.getRange(1, 1, 1, headers.length).getValues()[0];
        if (name === 'Users' && currHeaders[2] === 'password_hash') {
          sh.getRange(1, 3).setValue('password');
        }
      }
      formatSheet_(sh, cols);
      ss.setActiveSheet(sh);
      ss.moveActiveSheet(idx + 1);
      lines.push('- ' + name + ' [' + status + ']\n   Kolom: ' + headers.join(', '));
    });

    removeDefaultSheets_(ss, names);
    var seedInfo = seedDefaults_(ss);

    var msg = 'Database berhasil disiapkan\n\nData yang dibuat:\n' + lines.join('\n') +
              (seedInfo ? '\n\n' + seedInfo : '') + '\n\nBy - Fadhil';

    Logger.log(msg);
    try {
      SpreadsheetApp.getUi().alert('Setup Database', msg, SpreadsheetApp.getUi().ButtonSet.OK);
    } catch (e) {
      try {
        ss.toast('Database siap. By - Fadhil', 'Setup Database', 10);
      } catch (e2) {}
    }
    return msg;
  } catch (err) {
    Logger.log('SETUP ERROR: ' + err.message + '\n' + err.stack);
    throw new Error('Setup gagal: ' + err.message);
  }
}

function rapikanSpreadsheet() {
  try {
    var ss = getSpreadsheet_();
    var schema = getDbSchema_();
    var names = Object.keys(schema);
    names.forEach(function(name) {
      var sh = ss.getSheetByName(name);
      if (sh) {
        formatSheet_(sh, schema[name]);
      }
    });
    try {
      SpreadsheetApp.getUi().alert('Rapikan Spreadsheet', 'Seluruh sheet berhasil dirapikan dan diformat.\n\nBy - Fadhil', SpreadsheetApp.getUi().ButtonSet.OK);
    } catch (e) {
      ss.toast('Spreadsheet rapi. By - Fadhil', 'Rapikan', 5);
    }
  } catch (err) {
    throw new Error('Rapikan gagal: ' + err.message);
  }
}

function formatSheet_(sh, cols) {
  var n = cols.length;
  var rows = Math.max(sh.getMaxRows(), 2);

  // Format Header
  sh.getRange(1, 1, 1, n)
    .setFontWeight('bold')
    .setBackground('#0d9488')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sh.setRowHeight(1, 32);
  sh.setFrozenRows(1);

  // Format Kolom Data
  cols.forEach(function(c, i) {
    var r = sh.getRange(2, i + 1, rows - 1, 1).setVerticalAlignment('middle');
    if (c.type === 'date') {
      r.setNumberFormat('yyyy-mm-dd').setHorizontalAlignment('center');
    } else if (c.type === 'datetime') {
      r.setNumberFormat('yyyy-mm-dd hh:mm:ss').setHorizontalAlignment('center');
    } else if (c.type === 'number') {
      r.setNumberFormat('#,##0').setHorizontalAlignment('center');
    } else if (c.type === 'currency') {
      r.setNumberFormat('"Rp" #,##0').setHorizontalAlignment('right');
    } else if (c.type === 'boolean') {
      r.setHorizontalAlignment('center');
    } else if (c.type === 'longtext') {
      r.setWrap(true);
    }
  });

  // Terapkan Filter
  if (sh.getFilter()) sh.getFilter().remove();
  sh.getRange(1, 1, Math.max(sh.getLastRow(), 2), n).createFilter();

  // Autofit Kolom dengan batasan 90 - 360 px
  sh.autoResizeColumns(1, n);
  for (var i = 1; i <= n; i++) {
    var w = sh.getColumnWidth(i);
    if (w < 90) sh.setColumnWidth(i, 90);
    if (w > 360) sh.setColumnWidth(i, 360);
  }
}

function removeDefaultSheets_(ss, usedNames) {
  var sheets = ss.getSheets();
  sheets.forEach(function(sh) {
    var name = sh.getName();
    if (usedNames.indexOf(name) === -1) {
      if ((name.indexOf('Sheet') === 0 || name.indexOf('Lembar') === 0) && sh.getLastRow() === 0) {
        try {
          ss.deleteSheet(sh);
        } catch (e) {}
      }
    }
  });
}

function seedDefaults_(ss) {
  var userSheet = ss.getSheetByName('Users');
  var keuSheet = ss.getSheetByName('Keuangan');
  var katSheet = ss.getSheetByName('Kategori_Tugas');

  var seededInfo = [];

  // 1. Seed Akun Default: Uang ku / uangku (Plain Text Password)
  var targetUser = 'Uang ku';
  var targetPass = 'uangku';
  var targetUserId = 'U-UANGKU';
  var userRow = -1;

  if (userSheet && userSheet.getLastRow() > 1) {
    var uData = userSheet.getDataRange().getValues();
    for (var i = 1; i < uData.length; i++) {
      if (String(uData[i][1]).toLowerCase() === targetUser.toLowerCase()) {
        userRow = i + 1;
        targetUserId = String(uData[i][0]);
        // Update password ke plain text jika sebelumnya hash
        if (String(uData[i][2]) !== targetPass) {
          userSheet.getRange(userRow, 3).setValue(targetPass);
        }
        break;
      }
    }
  }

  if (userRow === -1 && userSheet) {
    userSheet.appendRow([targetUserId, targetUser, targetPass, '2026-09-28 00:00:00']);
    seededInfo.push('- Akun bawaan dibuat: ' + targetUser + ' (Password: ' + targetPass + ')');
  }

  // 2. Seed Kategori Tugas Bawaan
  if (katSheet && katSheet.getLastRow() <= 1) {
    var defaultCats = [
      ['KAT-01', targetUserId, 'Sistem Informasi', '#3b82f6', '2026-09-28 00:00:00'],
      ['KAT-02', targetUserId, 'Statistika', '#f59e0b', '2026-09-28 00:00:00'],
      ['KAT-03', targetUserId, 'Pemrograman', '#10b981', '2026-09-28 00:00:00'],
      ['KAT-04', targetUserId, 'Metodologi Penelitian', '#8b5cf6', '2026-09-28 00:00:00'],
      ['KAT-05', targetUserId, 'Manajemen Proyek', '#ef4444', '2026-09-28 00:00:00']
    ];
    katSheet.getRange(2, 1, defaultCats.length, defaultCats[0].length).setValues(defaultCats);
    seededInfo.push('- Kategori tugas kuliah awal dibuat (5 mata kuliah)');
  }

  // 3. Seed Transaksi Keuangan dari Lampiran Pengguna
  if (keuSheet) {
    var hasUserKeu = false;
    if (keuSheet.getLastRow() > 1) {
      var kData = keuSheet.getDataRange().getValues();
      for (var k = 1; k < kData.length; k++) {
        if (String(kData[k][1]) === targetUserId) {
          hasUserKeu = true;
          break;
        }
      }
    }

    if (!hasUserKeu) {
      var txList = getSeedTransactions_(targetUserId);
      if (txList.length > 0) {
        var startRow = keuSheet.getLastRow() + 1;
        keuSheet.getRange(startRow, 1, txList.length, txList[0].length).setValues(txList);
        seededInfo.push('- Berhasil memasukkan ' + txList.length + ' transaksi keuangan untuk user: ' + targetUser);
      }
    }
  }

  return seededInfo.join('\n');
}

/**
 * 146 Data Transaksi Keuangan Riil pengguna dari lampiran PDF
 */
function getSeedTransactions_(userId) {
  var rows = [
    // Page 1
    ['TX17905804199', userId, '2026-09-28', 'Pengeluaran', 'Internet & Pulsa', 'Paket Data 80 GB', 125000, '2026-09-28 15:27:00'],
    ['TX17905804880', userId, '2026-09-28', 'Pengeluaran', 'Makanan & Minuman', 'Indomi jumbo perpustakaan', 14000, '2026-09-28 15:28:08'],
    ['TX17905805136', userId, '2026-09-28', 'Pengeluaran', 'Makanan & Minuman', 'Sarapan pagi kampus', 15000, '2026-09-28 15:28:34'],
    ['TX17905812155', userId, '2026-09-28', 'Pengeluaran', 'Makanan & Minuman', 'Teh thailand (tenggarong)', 8000, '2026-09-28 15:40:16'],
    ['TX17905812823', userId, '2026-09-28', 'Pengeluaran', 'Makanan & Minuman', 'Patungan pentol (tenggarong)', 5000, '2026-09-28 15:41:22'],
    ['TX17905813350', userId, '2026-09-28', 'Pengeluaran', 'Transportasi', 'BBM pertamax', 18000, '2026-09-28 15:42:15'],
    ['TX17905813789', userId, '2026-09-28', 'Pengeluaran', 'Kebutuhan Harian', 'Plastik merah', 1000, '2026-09-28 15:42:59'],
    ['TX17905814382', userId, '2026-09-28', 'Pengeluaran', 'Makanan & Minuman', 'Nescafe Milo', 13000, '2026-09-28 15:43:58'],
    ['TX17905815048', userId, '2026-09-28', 'Pengeluaran', 'Makanan & Minuman', 'Kopi kapal apai shacet', 1500, '2026-09-28 15:45:05'],
    ['TX17905830743', userId, '2026-09-28', 'Pengeluaran', 'Biaya Admin', 'Admin Brimo', 1500, '2026-09-28 16:11:14'],
    ['TX17905833198', userId, '2026-09-28', 'Pemasukan', 'Kiriman Orang Tua', 'Sisa uang dan Kiriman Awal Bulan (ayah)', 595100, '2026-09-28 16:15:20'],
    ['TX17906612776', userId, '2026-09-29', 'Pengeluaran', 'Makanan & Minuman', 'Roti daeng', 6000, '2026-09-29 13:54:38'],

    // Page 2
    ['TX17906613256', userId, '2026-09-29', 'Pengeluaran', 'Kebutuhan Harian', 'Pewangi pakaian 2 pcs', 2000, '2026-09-29 13:55:26'],
    ['TX17906613582', userId, '2026-09-29', 'Pengeluaran', 'Makanan & Minuman', 'Dark chocolate', 2000, '2026-09-29 13:55:58'],
    ['TX17906614546', userId, '2026-09-29', 'Pengeluaran', 'Makanan & Minuman', 'Sarapan pagi kantin', 17000, '2026-09-29 13:57:35'],
    ['TX17906614794', userId, '2026-09-29', 'Pengeluaran', 'Makanan & Minuman', 'Es teh', 5000, '2026-09-29 13:57:59'],
    ['TX17906615270', userId, '2026-09-29', 'Pengeluaran', 'Transportasi', 'BBM pertalite pahlawan', 23000, '2026-09-29 13:58:47'],
    ['TX17906744116', userId, '2026-09-29', 'Pengeluaran', 'Makanan & Minuman', 'Permen', 2000, '2026-09-29 17:33:32'],
    ['TX17906932281', userId, '2026-09-29', 'Pengeluaran', 'Makanan & Minuman', 'Nasi uduk bandung', 15000, '2026-09-29 22:47:08'],
    ['TX17907582117', userId, '2026-09-30', 'Pengeluaran', 'Makanan & Minuman', 'Sarapan pagi kantin', 15000, '2026-09-30 16:50:12'],
    ['TX17907584484', userId, '2026-09-30', 'Pengeluaran', 'Makanan & Minuman', 'Es batu', 2000, '2026-09-30 16:54:08'],
    ['TX17907868641', userId, '2026-10-01', 'Pengeluaran', 'Makanan & Minuman', 'Bayar ganti uang Shopee food', 58000, '2026-10-01 00:47:44'],
    ['TX17907869032', userId, '2026-10-01', 'Pengeluaran', 'Makanan & Minuman', 'Nutrisi sari', 3000, '2026-10-01 00:48:23'],
    ['TX17907869364', userId, '2026-10-01', 'Pemasukan', 'Pendapatan Sampingan', 'Tip orderan', 2000, '2026-10-01 00:48:56'],
    ['TX17907869643', userId, '2026-10-01', 'Pemasukan', 'Pendapatan Sampingan', 'Shopee food', 8000, '2026-10-01 00:49:24'],
    ['TX17908259439', userId, '2026-10-01', 'Pemasukan', 'Lain-lain', 'Iuran beli kapur besi', 6000, '2026-10-01 11:39:04'],
    ['TX17908259786', userId, '2026-10-01', 'Pengeluaran', 'Kebutuhan Kuliah', 'Kapur besi 1 kota', 16000, '2026-10-01 11:39:39'],
    ['TX17908425130', userId, '2026-10-01', 'Pengeluaran', 'Makanan & Minuman', 'Sarapan pagi kantin', 15000, '2026-10-01 16:15:13'],
    ['TX17908425999', userId, '2026-10-01', 'Pengeluaran', 'Kesehatan', 'Vitamin C 500mg', 10000, '2026-10-01 16:16:40'],
    ['TX17908429540', userId, '2026-10-01', 'Pemasukan', 'Pendapatan Sampingan', 'Shopee food', 19200, '2026-10-01 16:22:34'],
    ['TX17909347548', userId, '2026-10-02', 'Pengeluaran', 'Makanan & Minuman', 'Roti daeng', 6000, '2026-10-02 17:52:35'],
    ['TX17909347762', userId, '2026-10-02', 'Pengeluaran', 'Makanan & Minuman', 'Susu milku', 4000, '2026-10-02 17:52:56'],
    ['TX17909348073', userId, '2026-10-02', 'Pengeluaran', 'Kebutuhan Harian', 'Ganti galon dinan', 25000, '2026-10-02 17:53:27'],
    ['TX17909999425', userId, '2026-10-03', 'Pengeluaran', 'Makanan & Minuman', 'Telur', 5000, '2026-10-03 11:59:03'],
    ['TX17909999712', userId, '2026-10-03', 'Pengeluaran', 'Makanan & Minuman', 'Beras', 17500, '2026-10-03 11:59:31'],
    ['TX17910002364', userId, '2026-10-03', 'Pengeluaran', 'Makanan & Minuman', 'Mi instan', 3500, '2026-10-03 12:03:56'],
    ['TX17910054267', userId, '2026-10-03', 'Pengeluaran', 'Makanan & Minuman', 'Ayam krispi', 9000, '2026-10-03 13:30:27'],
    ['TX17910257843', userId, '2026-10-03', 'Pengeluaran', 'Makanan & Minuman', 'Ayam Kentucky', 6000, '2026-10-03 19:09:44'],
    ['TX17910924234', userId, '2026-10-04', 'Pengeluaran', 'Makanan & Minuman', 'Nasi uduk bandung', 15000, '2026-10-04 13:40:23'],
    ['TX17910924524', userId, '2026-10-04', 'Pengeluaran', 'Makanan & Minuman', 'Air mineral vita', 4000, '2026-10-04 13:40:52'],
    ['TX17910970947', userId, '2026-10-04', 'Pengeluaran', 'Makanan & Minuman', 'Ayam Kentucky bang iwan', 9000, '2026-10-04 14:58:15'],
    ['TX17910971337', userId, '2026-10-04', 'Pengeluaran', 'Makanan & Minuman', 'Es batu', 2000, '2026-10-04 14:58:54'],
    ['TX17910971693', userId, '2026-10-04', 'Pengeluaran', 'Makanan & Minuman', 'Nutrisari', 3000, '2026-10-04 14:59:29'],

    // Page 3
    ['TX17911061631', userId, '2026-10-04', 'Pengeluaran', 'Transportasi', 'BBM pertalite SPBU pahlawan', 22000, '2026-10-04 17:29:23'],
    ['TX17911064611', userId, '2026-10-04', 'Pemasukan', 'Pendapatan Sampingan', 'Total pendapatan Shopee food 3-4 okto', 101925, '2026-10-04 17:34:21'],
    ['TX17911077816', userId, '2026-10-04', 'Pengeluaran', 'Hiburan', 'Langganan Vidio', 22089, '2026-10-04 17:56:22'],
    ['TX1792017197', userId, '2026-10-05', 'Pengeluaran', 'Makanan & Minuman', 'Sarapan pagi kantin kampus', 15000, '2026-10-05 20:02:00'],
    ['TX17912073173', userId, '2026-10-05', 'Pengeluaran', 'Transportasi', 'Tambah angin ban', 2000, '2026-10-05 21:35:17'],
    ['TX17912073768', userId, '2026-10-05', 'Pengeluaran', 'Makanan & Minuman', 'Ayam Kentucky Barokah', 6000, '2026-10-05 21:36:17'],
    ['TX17912142533', userId, '2026-10-05', 'Pengeluaran', 'Transportasi', 'BBM Pertamax SPBU pahlawan', 15000, '2026-10-05 23:30:53'],
    ['TX17912150090', userId, '2026-10-05', 'Pemasukan', 'Pendapatan Sampingan', 'Shopee food per 4-5 Oktober', 121800, '2026-10-05 23:43:29'],
    ['TX17912546829', userId, '2026-10-06', 'Pengeluaran', 'Makanan & Minuman', 'Lauk kikil sapi', 10000, '2026-10-06 10:44:43'],
    ['TX17912547486', userId, '2026-10-06', 'Pengeluaran', 'Makanan & Minuman', 'Pentol goreng', 4000, '2026-10-06 10:45:49'],
    ['TX17912548121', userId, '2026-10-06', 'Pengeluaran', 'Makanan & Minuman', 'Yakult 2pcs', 5000, '2026-10-06 10:46:52'],
    ['TX17912548508', userId, '2026-10-06', 'Pengeluaran', 'Transportasi', 'Parkir ricis', 3000, '2026-10-06 10:47:31'],
    ['TX17913429689', userId, '2026-10-07', 'Pengeluaran', 'Makanan & Minuman', 'Kopi Nescaffe', 14700, '2026-10-07 11:16:09'],
    ['TX17913429969', userId, '2026-10-07', 'Pengeluaran', 'Makanan & Minuman', 'Indomie goreng jumbo', 4500, '2026-10-07 11:16:37'],
    ['TX17913430224', userId, '2026-10-07', 'Pengeluaran', 'Makanan & Minuman', 'Telur', 2000, '2026-10-07 11:17:02'],
    ['TX17913452776', userId, '2026-10-07', 'Pengeluaran', 'Makanan & Minuman', 'Ayam Kentucky bang ivan', 9000, '2026-10-07 11:54:38'],
    ['TX17913548976', userId, '2026-10-07', 'Pengeluaran', 'Makanan & Minuman', 'Es batu', 2000, '2026-10-07 14:34:58'],
    ['TX17913624929', userId, '2026-10-07', 'Pengeluaran', 'Makanan & Minuman', 'Beras 1 kg', 17500, '2026-10-07 16:41:33'],
    ['TX17913625250', userId, '2026-10-07', 'Pengeluaran', 'Makanan & Minuman', 'Ayam Kentucky barokah', 6000, '2026-10-07 16:42:05'],
    ['TX17913625785', userId, '2026-10-07', 'Pengeluaran', 'Makanan & Minuman', 'Lauk Sayur santan daun singkong', 5000, '2026-10-07 16:42:59'],
    ['TX17914415166', userId, '2026-10-08', 'Pengeluaran', 'Kesehatan', 'Saleb hitam (bisulan)', 15000, '2026-10-08 14:38:37'],
    ['TX17914416249', userId, '2026-10-08', 'Pengeluaran', 'Kesehatan', 'Obat minum (Bisulan)', 21000, '2026-10-08 14:40:25'],
    ['TX17914540752', userId, '2026-10-08', 'Pemasukan', 'Kiriman Orang Tua', 'Sangu dari Abi (7 Oktober 2026 )', 500000, '2026-10-08 18:07:55'],
    ['TX17914541146', userId, '2026-10-08', 'Pengeluaran', 'Makanan & Minuman', 'Susu kental manis putih 2 pcs', 3000, '2026-10-08 18:08:35'],
    ['TX17914545064', userId, '2026-10-08', 'Pengeluaran', 'Makanan & Minuman', 'Roti daeng', 6000, '2026-10-08 18:15:06'],
    ['TX17914545313', userId, '2026-10-08', 'Pengeluaran', 'Makanan & Minuman', 'Es batu', 2000, '2026-10-08 18:15:31'],
    ['TX17915184585', userId, '2026-10-09', 'Pengeluaran', 'Makanan & Minuman', 'Lauk sayur nangka', 5000, '2026-10-09 12:00:59'],
    ['TX17915186392', userId, '2026-10-09', 'Pengeluaran', 'Makanan & Minuman', 'Mengga manis setengah Kg', 12000, '2026-10-09 12:03:59'],
    ['TX17915186917', userId, '2026-10-09', 'Pengeluaran', 'Makanan & Minuman', 'Es batu', 2000, '2026-10-09 12:04:52'],
    ['TX17915343983', userId, '2026-10-09', 'Pengeluaran', 'Ibadah & Sedekah', 'Infak jum\'at', 5000, '2026-10-09 16:26:38'],
    ['TX17915584048', userId, '2026-10-09', 'Pengeluaran', 'Makanan & Minuman', 'Lauk ikan', 10000, '2026-10-09 23:06:45'],

    // Page 4
    ['TX17916139945', userId, '2026-10-10', 'Pengeluaran', 'Kebutuhan Harian', 'Alat service handphone', 51490, '2026-10-10 14:33:15'],
    ['TX17916147462', userId, '2026-10-10', 'Pengeluaran', 'Kebutuhan Harian', 'Double swab (alat mengeluarkan cairan in', 8000, '2026-10-10 14:45:46'],
    ['TX17916149061', userId, '2026-10-10', 'Pengeluaran', 'Makanan & Minuman', 'Ayam geprek mbah har', 8000, '2026-10-10 14:48:26'],
    ['TX17916149448', userId, '2026-10-10', 'Pengeluaran', 'Makanan & Minuman', 'Sayur kikil sapi', 3000, '2026-10-10 14:49:05'],
    ['TX17916149843', userId, '2026-10-10', 'Pengeluaran', 'Makanan & Minuman', 'Es batu', 2000, '2026-10-10 14:49:44'],
    ['TX17916150576', userId, '2026-10-10', 'Pengeluaran', 'Makanan & Minuman', 'Ayam geprek bang ivan', 9000, '2026-10-10 14:50:58'],
    ['TX17916151542', userId, '2026-10-10', 'Pengeluaran', 'Makanan & Minuman', 'Ayam Kentucky penjual tahu tek', 7000, '2026-10-10 14:52:34'],
    ['TX17916183970', userId, '2026-10-10', 'Pengeluaran', 'Makanan & Minuman', 'Susu fresen flaig', 4000, '2026-10-10 15:46:37'],
    ['TX17916184757', userId, '2026-10-10', 'Pengeluaran', 'Kebutuhan Harian', 'Tisu Paseo', 2000, '2026-10-10 15:47:56'],
    ['TX17916207006', userId, '2026-10-10', 'Pengeluaran', 'Transportasi', 'BBM SPBU flyover pertalite', 10000, '2026-10-10 16:25:01'],
    ['TX17916366695', userId, '2026-10-10', 'Pengeluaran', 'Makanan & Minuman', 'Tahu Tek', 13000, '2026-10-10 20:51:10'],
    ['TX17916376190', userId, '2026-10-10', 'Pemasukan', 'Investasi', 'Jual emas digital', 44086, '2026-10-10 21:06:59'],
    ['TX17916492718', userId, '2026-10-11', 'Pengeluaran', 'Makanan & Minuman', 'Roma kelapa krim', 10000, '2026-10-11 00:21:12'],
    ['TX17916943539', userId, '2026-10-11', 'Pengeluaran', 'Makanan & Minuman', 'Nasi kuning ks Tubun', 15000, '2026-10-11 12:52:34'],
    ['TX17916943851', userId, '2026-10-11', 'Pengeluaran', 'Transportasi', 'BBM SPBU flyover pertalite', 15000, '2026-10-11 12:53:05'],
    ['TX17916985384', userId, '2026-10-11', 'Pengeluaran', 'Makanan & Minuman', 'Es batu', 2000, '2026-10-11 14:02:18'],
    ['TX17916986328', userId, '2026-10-11', 'Pengeluaran', 'Makanan & Minuman', 'Nutri sari', 3000, '2026-10-11 14:03:53'],
    ['TX17917403486', userId, '2026-10-12', 'Pengeluaran', 'Makanan & Minuman', 'Lauk ikan', 10000, '2026-10-12 01:39:09'],
    ['TX17917487015', userId, '2026-10-12', 'Pengeluaran', 'Makanan & Minuman', 'Nasi uduk bandung', 15000, '2026-10-12 03:58:22'],
    ['TX17917755429', userId, '2026-10-12', 'Pengeluaran', 'Makanan & Minuman', 'Es Teh', 5000, '2026-10-12 11:25:43'],
    ['TX17918530268', userId, '2026-10-13', 'Pengeluaran', 'Makanan & Minuman', 'Kripik singkong', 10000, '2026-10-13 08:57:07'],
    ['TX17918531484', userId, '2026-10-13', 'Pengeluaran', 'Transportasi', 'BBM pertalite SPBU pahlawan', 20000, '2026-10-13 08:59:08'],
    ['TX17918532307', userId, '2026-10-13', 'Pengeluaran', 'Makanan & Minuman', 'Nasi kuning (depan masjid Pramuka)', 15000, '2026-10-13 09:00:31'],
    ['TX17918773792', userId, '2026-10-13', 'Pengeluaran', 'Makanan & Minuman', 'Roti Daeng', 6000, '2026-10-13 15:42:59'],
    ['TX17918774483', userId, '2026-10-13', 'Pengeluaran', 'Makanan & Minuman', 'Es teh', 5000, '2026-10-13 15:44:08'],
    ['TX17918835592', userId, '2026-10-13', 'Pengeluaran', 'Biaya Admin', 'Admin bayar gopay ke dana', 1000, '2026-10-13 17:25:59'],
    ['TX17918842112', userId, '2026-10-13', 'Pemasukan', 'Pendapatan Sampingan', 'Shopee food 10 - 12 Oktober 2026', 193000, '2026-10-13 17:36:51'],
    ['TX17919479393', userId, '2026-10-14', 'Pengeluaran', 'Makanan & Minuman', 'Biskuit (biskuat) 2pcs', 4000, '2026-10-14 11:18:59'],
    ['TX17919480039', userId, '2026-10-14', 'Pengeluaran', 'Makanan & Minuman', 'Buter scot (kopi kenangan)', 24000, '2026-10-14 11:20:04'],
    ['TX17919550117', userId, '2026-10-14', 'Pengeluaran', 'Makanan & Minuman', 'Lauk ikan', 10000, '2026-10-14 13:16:52'],
    ['TX17920405973', userId, '2026-10-15', 'Pengeluaran', 'Kebutuhan Harian', 'Vape liq ref 45 day', 16900, '2026-10-15 13:03:17'],

    // Page 5
    ['TX17920406675', userId, '2026-10-15', 'Pengeluaran', 'Makanan & Minuman', 'Ultra milk taro 200 Ml', 5400, '2026-10-15 13:04:28'],
    ['TX17920407462', userId, '2026-10-15', 'Pengeluaran', 'Kebutuhan Harian', 'Molto aid blue scht 18ML', 11500, '2026-10-15 13:05:46'],
    ['TX17920407757', userId, '2026-10-15', 'Pengeluaran', 'Kebutuhan Harian', 'Rinso bubuk', 10000, '2026-10-15 13:06:16'],
    ['TX17920410508', userId, '2026-10-15', 'Pengeluaran', 'Makanan & Minuman', 'Ayam Kentucky barakah', 6000, '2026-10-15 13:10:51'],
    ['TX17920737027', userId, '2026-10-15', 'Pengeluaran', 'Makanan & Minuman', 'Es Teh', 5000, '2026-10-15 22:15:03'],
    ['TX17920737565', userId, '2026-10-15', 'Pengeluaran', 'Makanan & Minuman', 'Lauk Gori & Tempe Orek', 8000, '2026-10-15 22:15:57'],
    ['TX17920738386', userId, '2026-10-15', 'Pengeluaran', 'Transportasi', 'BBM Pertalite SPBU Pahlawan', 20000, '2026-10-15 22:17:19'],
    ['TX17920753528', userId, '2026-10-15', 'Pengeluaran', 'Kebutuhan Kuliah', 'Big Boss B5 182 x 257.5mm, 50 Sheets, 2', 12950, '2026-10-15 22:42:33'],
    ['TX17920753942', userId, '2026-10-15', 'Pengeluaran', 'Transportasi', 'Bayar Parkir', 2000, '2026-10-15 22:43:14'],
    ['TX17920757966', userId, '2026-10-15', 'Pengeluaran', 'Biaya Admin', 'Biaya Administrasi Bulanan Rek BRI Oktol', 8000, '2026-10-15 22:49:57'],
    ['TX17920766903', userId, '2026-10-15', 'Pengeluaran', 'Transportasi', 'Parkir Kopken M yamin', 2000, '2026-10-15 23:04:50'],
    ['TX17920918236', userId, '2026-10-16', 'Pengeluaran', 'Makanan & Minuman', 'Pentol goreng', 10000, '2026-10-16 03:17:04'],
    ['TX17921406492', userId, '2026-10-16', 'Pengeluaran', 'Makanan & Minuman', 'Roti Daeng', 6000, '2026-10-16 16:50:49'],
    ['TX17922228392', userId, '2026-10-17', 'Pengeluaran', 'Makanan & Minuman', 'Pentol goreng CGV', 10000, '2026-10-17 15:40:39'],
    ['TX17922228860', userId, '2026-10-17', 'Pemasukan', 'Pendapatan Sampingan', 'Tip Shopee Food Salah Titik', 15000, '2026-10-17 15:41:26'],
    ['TX17922253604', userId, '2026-10-17', 'Pengeluaran', 'Makanan & Minuman', 'Kopi Susu Aren Tumoro', 17500, '2026-10-17 16:22:40'],
    ['TX17922426204', userId, '2026-10-17', 'Pengeluaran', 'Makanan & Minuman', 'Telur ayam', 2000, '2026-10-17 21:10:20'],
    ['TX17922426462', userId, '2026-10-17', 'Pengeluaran', 'Transportasi', 'Bayar parkir tumoro', 2000, '2026-10-17 21:10:46'],
    ['TX17922426763', userId, '2026-10-17', 'Pengeluaran', 'Makanan & Minuman', 'Roti Daeng', 6000, '2026-10-17 21:11:16'],
    ['TX17922428202', userId, '2026-10-17', 'Pengeluaran', 'Transportasi', 'BBM pertalite SPBU pahlawan', 25000, '2026-10-17 21:13:40'],
    ['TX17922908490', userId, '2026-10-18', 'Pengeluaran', 'Makanan & Minuman', 'Lauk ayam goreng', 10000, '2026-10-18 10:34:09'],
    ['TX17922913863', userId, '2026-10-18', 'Pengeluaran', 'Makanan & Minuman', 'Nasi kuning porfo', 15000, '2026-10-18 10:43:06'],
    ['TX17923064568', userId, '2026-10-18', 'Pengeluaran', 'Makanan & Minuman', 'Nasi Padang Juanda 8', 17000, '2026-10-18 14:54:17'],
    ['TX17923171281', userId, '2026-10-18', 'Pengeluaran', 'Transportasi', 'Oli mesin Shell helix hx 5 Sab', 95000, '2026-10-18 17:52:08'],
    ['TX17923213926', userId, '2026-10-18', 'Pengeluaran', 'Makanan & Minuman', 'Ayam Kentucky barokah', 6000, '2026-10-18 19:03:13'],
    ['TX17923809071', userId, '2026-10-19', 'Pengeluaran', 'Makanan & Minuman', 'Sarapan Ayam Kampus', 13000, '2026-10-19 11:35:07'],
    ['TX17924139460', userId, '2026-10-19', 'Pengeluaran', 'Kebutuhan Kuliah', 'Kertas folio bergaris', 5000, '2026-10-19 20:45:46'],
    ['TX17924140139', userId, '2026-10-19', 'Pengeluaran', 'Kebutuhan Kuliah', 'Bolt point (Koro)', 8000, '2026-10-19 20:46:54'],
    ['TX17924158489', userId, '2026-10-19', 'Pengeluaran', 'Makanan & Minuman', 'Lauk ikan', 10000, '2026-10-19 21:17:29'],
    ['TX17924159243', userId, '2026-10-19', 'Pengeluaran', 'Transportasi', 'BBM Pertalite SPBU pahlawan', 19000, '2026-10-19 21:18:44'],
    ['TX17924529881', userId, '2026-10-20', 'Pengeluaran', 'Makanan & Minuman', 'Nasi jagung depan masjid Jabal Nur', 13000, '2026-10-20 07:36:28'],

    // Page 6
    ['TX17924532934', userId, '2026-10-20', 'Pemasukan', 'Pendapatan Sampingan', 'Shopee food tanggal 16 - 18 Oktober 2026', 146000, '2026-10-20 07:41:33'],
    ['TX17924895446', userId, '2026-10-20', 'Pengeluaran', 'Makanan & Minuman', 'Roti Daeng', 6000, '2026-10-20 17:45:45'],
    ['TX17924895848', userId, '2026-10-20', 'Pengeluaran', 'Makanan & Minuman', 'Es Batu', 2000, '2026-10-20 17:46:25'],
    ['TX17925020029', userId, '2026-10-20', 'Pengeluaran', 'Makanan & Minuman', 'Beli pentol', 10000, '2026-10-20 21:13:23'],
    ['TX17925471859', userId, '2026-10-21', 'Pengeluaran', 'Makanan & Minuman', 'Lauk Ikan dan Tempe', 15000, '2026-10-21 09:46:26'],
    ['TX17925575369', userId, '2026-10-21', 'Pengeluaran', 'Makanan & Minuman', 'Bubur kacang hijau (belikan hakim juga)', 20000, '2026-10-21 12:38:57'],
    ['TX17925604332', userId, '2026-10-21', 'Pengeluaran', 'Makanan & Minuman', 'Es teh', 5000, '2026-10-21 13:27:13'],
    ['TX17925637615', userId, '2026-10-21', 'Pengeluaran', 'Makanan & Minuman', 'Roti Aok', 3000, '2026-10-21 14:22:42'],
    ['TX17925960038', userId, '2026-10-21', 'Pengeluaran', 'Makanan & Minuman', 'Sayur nangka', 5000, '2026-10-21 23:20:04'],
    ['TX17925960378', userId, '2026-10-21', 'Pengeluaran', 'Transportasi', 'BBM Pertamax SPBU pahlawan', 15000, '2026-10-21 23:20:38'],
    ['TX17926009568', userId, '2026-10-22', 'Pengeluaran', 'Makanan & Minuman', 'Lauk ayam geprek dan tahu tempe Mbah Har', 12000, '2026-10-22 00:42:37'],
    ['TX17926010202', userId, '2026-10-22', 'Pengeluaran', 'Makanan & Minuman', 'Mi sukses rendang', 4000, '2026-10-22 00:43:40'],
    ['TX17926010676', userId, '2026-10-22', 'Pengeluaran', 'Makanan & Minuman', 'Permen Mentos', 1000, '2026-10-22 00:44:28'],
    ['TX17926375234', userId, '2026-10-22', 'Pengeluaran', 'Kebutuhan Kuliah', 'Print materi Material Teknik 2', 2000, '2026-10-22 10:52:03'],
    ['TX17927391658', userId, '2026-10-23', 'Pengeluaran', 'Makanan & Minuman', 'Bak Pao ayam 2pcs', 10000, '2026-10-23 15:06:06'],
    ['TX17927392367', userId, '2026-10-23', 'Pemasukan', 'Kiriman Orang Tua', 'Sangu dan bayar PDH Hitam (dari Abi)', 700000, '2026-10-23 15:07:17'],
    ['TX17927392787', userId, '2026-10-23', 'Pengeluaran', 'Makanan & Minuman', 'Eskrim semangka', 4000, '2026-10-23 15:07:59'],
    ['TX17927393229', userId, '2026-10-23', 'Pengeluaran', 'Makanan & Minuman', 'Mi indomi jumbo ayam goreng', 4500, '2026-10-23 15:08:43'],
    ['TX17927496258', userId, '2026-10-23', 'Pengeluaran', 'Makanan & Minuman', 'Roti Pisang Cklt', 6000, '2026-10-23 18:00:26'],
    ['TX17927497312', userId, '2026-10-23', 'Pengeluaran', 'Kesehatan', 'Amunaizer BTL 140ML', 9300, '2026-10-23 18:02:11'],
    ['TX17927608133', userId, '2026-10-23', 'Pengeluaran', 'Kebutuhan Harian', 'Baras SPH 5 kg (depan jalan perjuangan 5)', 70000, '2026-10-23 21:06:53'],
    ['TX17927627760', userId, '2026-10-23', 'Pengeluaran', 'Transportasi', 'BBM pertalite SPBU pahlawan', 20000, '2026-10-23 21:39:36']
  ];
  return rows;
}
