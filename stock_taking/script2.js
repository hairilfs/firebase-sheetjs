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
		downloadExcel();		
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

function downloadExcel() {

	if (_datalist) {

		var to_excel = [];

		var counter = 0;
		_.forEach(_datalist, function(value, key){
			value['PARTS'] = key;
			to_excel[counter] = value;

			counter++;
		});

		console.log(Object.keys(to_excel[0]));
		console.log(to_excel);
		
		// console.log(ws, to_excel, Object.keys(to_excel[0]))
		var filename = _now+"_download.xlsx";
		var wb = XLSX.utils.book_new();
		var ws = XLSX.utils.json_to_sheet(to_excel, { header: Object.keys(to_excel[0]), skipHeader: false });
		var ws_name = "Sheet1";	
		 
		/* add worksheet to workbook */
		XLSX.utils.book_append_sheet(wb, ws, ws_name);

		/* write workbook */
		XLSX.writeFile(wb, filename);


	}
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

	console.log(obj)

	var table_head = [];
	var set_firebase = {};

	obj.forEach(function(item, index) {

		if (index == 0) { 	// ambil headernya

			item.forEach(function(item, index){
				if (index > 0) { // kolom pertama di skip
					table_head.push(item.trim());
				}
			});

			return;

		} else {	// ambil datanya
				
			var pairs = [];
			var code = '';

			item.forEach(function(item, index){
				if (index > 0) {	// kolom pertama di skip				
					var arr = new Array(table_head[index-1], (item ? item.trim() : 'null'));
					pairs.push(arr);
				} else { // masukin kodenya
					code = item;
				}
			});

			set_firebase[code] = _.fromPairs(pairs);
		}

	});

	_database.ref(_dir).set(
		set_firebase
	);	

	setTimeout(function(){
		$('#see_firebase').click();
	}, 200);
}

_database.ref(_dir).on('value', function(snapshot) {

  	_datalist = {};
  	_datalist = snapshot.val();
  	// window.isi = _datalist;

  	// console.log(_datalist);

  	if (_datalist) {
  		var thead_data = [];
	  	var tbody = thead = '';

	  	var counter = 0;
	  	_.forEach(_datalist, function(value, key){

	  		if (counter == 0) {
	  			thead = '<tr>';

	  			thead_data.push('PARTS');
				thead += '<th>PARTS</th>';
	  			_.forEach(value, function(value_head, key_head){
	  				thead_data.push(key_head);
					thead += '<th>'+key_head+'</th>';
	  			});

				thead += '</tr>';
				_table.find('thead').html(thead);

				counter++;
	  		}

	  		tbody += '<tr>';

	  		_.forEach(thead_data, function(value_body, key_body){

	  			if (value_body == 'PARTS') {
			  		tbody += '<td>'+key+'</td>';
	  			} else {	  			
			  		tbody += '<td>'+value[value_body]+'</td>';
	  			}
	  		});

	  		tbody += '</tr>';
	  	});

	  	_table.find('tbody').html(tbody);	  	

	  	console.log('Data has been received!')


  	}

});