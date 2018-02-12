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
var _database = firebase.database();

function writeUserData(obj) {
	var the_id = Date.now();

	_database.ref('stock_taking/' + the_id).set({
	name: obj.name,
	email: obj.email
	});
}

function updateUserData(obj) {
  	return _database.ref().update(obj);
}

function deleteUserData(obj) {

  	return _database.ref(obj).remove()
  	.then(function() {
	    console.log("Remove succeeded.")
	})
	.catch(function(error) {
	    console.log("Remove failed: " + error.message)
	});
}

var datalist = {};
_database.ref('stock_taking').on('value', function(snapshot) {
	datalist = {};
  	datalist = snapshot.val();
  	window.isi = datalist;

  	var list = '';
  	$('tbody').empty();
  	$.each(snapshot.val(), function(index, value) {

  		list += '<tr>';		
  		list += 	'<td>'+index+'</td>';		
  		list += 	'<td>'+value.name+'</td>';		
  		list += 	'<td>'+value.email+'</td>';		
  		list += 	'<td><a href="#" class="edit" data-index="'+index+'">Edit</a> &nbsp; | &nbsp; <a href="#" class="delete" data-index="'+index+'">Delete</a></td>';		
  		list += '</tr>';		
  	});

  	$('tbody').html(list);

});

$('form#add_user').on('submit', function(e){
	e.preventDefault();

	var data = {
		name: $(this).find('input[name=nama]').val(),
		email: $(this).find('input[name=email]').val(),
		mode: $(this).find('input[name=mode]').val(),
		id: $(this).find('input[name=id]').val()
	};

	if (data.mode == 'add') {
		writeUserData(data);
		resetForm();
		console.log('User berhasil ditambah!')
	} else if (data.mode == 'edit') {
		var x = data.id;
		delete data.mode; delete data.id;

		var updates = {};
		updates['/stock_taking/' + x] = data;
		updateUserData(updates);
		console.log('User berhasil diupdate!')
	}
});

$('table').on('click', '.edit', function(e){
	e.preventDefault();

	var _index = $(this).data('index');

	$('input[name=nama]').val(datalist[_index].name).focus();
	$('input[name=email]').val(datalist[_index].email);
	$('input[name=id]').val(_index);
	$('input[name=mode]').val('edit');

	$('#new_data').hide();
	$('#edit_data').show();

});

$('table').on('click', '.delete', function(e){
	e.preventDefault();

	var _index = $(this).data('index');

	if( confirm('Are you sure to delete '+ _index +'?') ) {
		deleteUserData('stock_taking/'+_index);
	} else {
		return false;
	}

});

function cancelEdit(obj) {
	$(obj).parent().hide();
	resetForm();

}

function resetForm() {
	$('#new_data').show();
	$('input[name=id]').val('');
	$('input[name=nama]').val('').focus();
	$('input[name=email]').val('');
	$('input[name=mode]').val('add');
}