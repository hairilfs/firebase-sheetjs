$(function() {
	$('.btn-top').on('click', function(e){
		$(this).addClass('button-primary').siblings().removeClass('button-primary');

		if ($(this).attr('id') == 'upload_excel') {
			$('.in-row-firebase').hide();
			$('#row_file').show();
		} else {
			$('#row_file').hide();
			$('#table_firebase').show();
			if (_datalist) {
				$('#download_excel').show();
			}

		}
	});


	$('#upload_firebase').on('click', function(e){
		var sheet1 = Object.keys(excel_data)[0]; // ambil sheet1/Sheet1
		var to_firebase = excel_data[sheet1];

		$(this).html('Uploading...');
		writeUserData(to_firebase);
		$(this).html('Upload to firebase');
	});

	$('#download_excel').on('click', function(e){
		if (_datalist) {
			console.log('kemari')
			
			var filename = _now+"_download.xlsx";
			var wb = XLSX.utils.book_new();
			var ws = XLSX.utils.json_to_sheet( _datalist, {header: Object.keys(_datalist[0]), skipHeader: false});
			var ws_name = "Sheet1";	
			 
			/* add worksheet to workbook */
			XLSX.utils.book_append_sheet(wb, ws, ws_name);

			/* write workbook */
			XLSX.writeFile(wb, filename);

			console.log(ws)
			console.log(_datalist)
			console.log(Object.keys(_datalist[0]))

		}
	});
	
});

/*
| ===================================	
| Function for SheetJS
| ===================================
*/

var xl = document.getElementById('file_excel');
	xl.addEventListener('change', handleFile, false);
var excel_data = {};

function handleFile(e) { 
	readURL(e.target.files);
}

function readURL(input) {
	var f = input[0];
	var reader = new FileReader();

	reader.onload = function(e) {
		var data = e.target.result;

		var x = to_json(XLSX.read(data, { 
			type: 'array' 
		}));

		console.log(x);
		renderHtml(x);
	}

	reader.readAsArrayBuffer(f);
}

function to_json(workbook) {
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header:1 });
		if(roa.length) excel_data[sheetName] = roa;
	});
	
	return excel_data;
}

function renderHtml(json) {
	var content = '';

	var index = Object.keys(json)[0]; // ambil sheet1/Sheet1
	json[index].forEach(function(value, index){
		if (value.length == 0) { return; } // kalo kosong, skip
		content +=	'<tr>';

			value.forEach(function(value, item){
				if (index == 0) {
					content += '<th>'+value+'</th>';
				} else {
					content += '<td>'+value+'</td>';

				}
			});

		content +=	'</tr>';
	});

	$('#table_excel').html(content);
	$('.in-row-file').show();

}


/*
| ===================================	
| Function for Firebase
| ===================================
*/

// Initialize Firebase
var config = {
	apiKey: "AIzaSyCMJsY9ZfPJfyzl031dawQ08cqMU-MjTIk",
	authDomain: "hfs-firebase-001.firebaseapp.com",
	databaseURL: "https://hfs-firebase-001.firebaseio.com",
	projectId: "hfs-firebase-001",
	storageBucket: "hfs-firebase-001.appspot.com",
	messagingSenderId: "1064983358283"
};

firebase.initializeApp(config);

// Get a reference to the database service
var _database 	= firebase.database();
var _now 		= moment().format("YYYY-MM-DD");
var _dir 		= 'stock_taking';
var _table 		= $('#table_firebase');
var _datalist 	= {};

function writeUserData(obj) {

	var table_head = [];

	obj.forEach(function(item, index) {

		if (index == 0) { 	// ambil headernya

			item.forEach(function(item, index){
				table_head.push(item);
			});

			return;

		} else {	// ambil datanya
				
			var pairs = [];

			item.forEach(function(item, index){
				var arr = new Array(table_head[index], item);
				pairs.push(arr);
			});

			_database.ref(_dir +'/'+ _now +'/'+ (index-1)).set(
				_.fromPairs(pairs)
			);	
		}

		setTimeout(function(){
			$('#see_firebase').click();
		}, 200);

	});
}

_database.ref(_dir +'/'+ _now).on('value', function(snapshot) {

  	_datalist = {};
  	_datalist = snapshot.val();
  	// window.isi = _datalist;

  	if (_datalist) {
  		var thead_data = [];
	  	var tbody = thead = '';

	  	_datalist.forEach(function(item, index) {

	  		if (index == 0) {
	  			thead = '<tr>';

	  			Object.keys(item).forEach(function(item, index){
	  				thead_data.push(item);
					thead += '<th>'+item+'</th>';
	  			});
				thead += '</tr>';
				_table.find('thead').html(thead);
	  		}

	  		tbody += '<tr>';

	  		thead_data.forEach(function(item_key, index_key){
		  		tbody += '<td>'+item[item_key]+'</td>';
	  		});

	  		tbody += '</tr>';
	  	});

	  	_table.find('tbody').html(tbody);	  	

	  	console.log('Data has been received!')

  	}

});