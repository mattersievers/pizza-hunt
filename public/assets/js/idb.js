//var to hold db connection
let db;

// establish connection to IndexedDB called pizza_hunt and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

//checks if the database version changes
request.onupgradeneeded = function(event) {
    //save reference to the database
    const db = event.target.result;

    //create an object store
    db.createObjectStore('new_pizza', { autoIncrement: true });
}

// upon a successful
request.onsuccess = function(event) {
    //when db is successfully created with object store from onupgradeneeded
    db = event.target.result;

    if(navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//we attempt to submit a pizza and there is no internet connection
function saveRecord(record) {
    //open a new transaction
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access the object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //add record to the store with the add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    const pizzaObjectStore = transaction.objectStore('new_pizza');

    const getAll = pizzaObjectStore.getAll();

     // get all records from store and set to a variable
    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if(serverResponse.message){
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    pizzaObjectStore.clear();

                    alert('All saved pizza has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};

//listen for app coming back online
window.addEventListener('online', uploadPizza);