// Julia Becker
// WDI - March 30, 2015
// W03/D01 Homework

var net = require('net');
var fs = require('fs');
var colors = require('colors');

var dataFile = "./data.json";
var userArray = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

function save(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data));
}

var server = net.createServer();

var inputArray = [];
var user;
var username;

server.on('connection', function(client) {
    console.log('client connected');
    client.setEncoding('utf8');
    client.write(colors.bold("\nWelcome to the Books App!\n\n"));
    client.write("Existing users, please type 'user YOUR USERNAME' to access your account.\nNew users, enter new_user NEW USERNAME (one word) to create a new account.\n\n");

    client.on('data', function(stringFromClient) {
        inputArray = stringFromClient.split(' ');
        var command = inputArray[0].trim();

        switch (command) {
            case 'new_user': // Create new account
                newUser(inputArray[1], client);
                break;
            case 'user':
                getUser(inputArray[1], client);
                break;
            case 'add':
                add(client);
                break;
            case 'my_books':
                myBooks(client);
                break;
            case 'view_recommended':
                showRecommended(client);
                break;
            case 'help':
                getHelp(client);
                break;
            case 'log_out':
                logOut(client);
                break;
            default:
                getHelp(client);
                break;
        }
    });
});

// Creates a new user
function newUser(str, client) {
    if (inputArray.length === 2) {
        username = str.trim();
        user = {
            username: username,
            books: []
        };

        userArray.push(user);
        save(userArray);

        client.write(colors.bold("\nWelcome " + username + "!\n\n"));
        client.write("Your account has successfully been created.\n\nTo add a book you recommend,  type 'add [book name]'.\nOr to view recommended books across all users, type 'view_recommended'.\n\n");

    } else if (inputArray.length !== 2) {
        client.write("Please enter a one word username.\n");
    }
}

// Accesses existing user info
function getUser(str, client) {
    if (inputArray.length > 1) {
        username = str.trim();

        for (i = 0; i < userArray.length; i++) {
            if (username === userArray[i].username) {
                user = userArray[i];
                client.write(colors.bold("\nWelcome " + username + "!\n\n"));
                client.write("To view all your recommended books, type 'my_books' in the console.\nTo add a book, type 'add book title'.\nOr if you would like to view books recommended by other users, type 'view_recommended'\n\n");
            } else if (user === {}) {
                client.write("Sorry, it looks like that username doesn't exist. Create a new account by typing 'new_user [username]\n\n");
            }
        }
    } else {
        client.write("Please enter your username to login.\n\n")
    }
}

// Adds a book to a user's list
function add(client) {

    if (inputArray.length > 1) {
        // User not signed in
        if (user === undefined) {
            client.write("Please sign in before adding books to your account. Type 'user [username] to access an existing account or 'new_user [username]' to create a new account.\n\n")
                // User is signed in - Add book to their list
        } else {
            var title = "";
            for (i = 1; i < inputArray.length; i++) {
                title += inputArray[i].trim() + " ";
            }
            var book = {
                title: title.trim()
            }
            user.books.push(book);

            // Save book to data file under user's account
            for (i = 0; i < userArray.length; i++) {
                if (userArray[i].username === user.username) {
                    userArray[i] = user;
                }
            }

            save(userArray);
            client.write(username + " - " + title + "has been added to your recommended books list.\n\n")
        }

        // User didn't add a book title
    } else {
        client.write("Please enter a book title for the book you would like to add. Type 'add [book title]'\n\n")
    }
}

// Grabs all books in a user's list
function myBooks(client) {
    client.write("\nYou recommend:\n\n")

    for (i = 0; i < userArray.length; i++) {
        if (userArray[i].username === username) { // Display only current users books
            var myBooks = userArray[i].books;
            for (j = 0; j < myBooks.length; j++) {
                client.write(myBooks[j].title + "\n")
            }
        }
    }
}

// Grabs all books recommended by other users 
function showRecommended(client) {
    client.write("\nUsers recommend:\n\n")

    for (i = 0; i < userArray.length; i++) {
        if (userArray[i].username != username) { // Don't display current users books
            for (j = 0; j < userArray[i].books.length; j++) {
                client.write(userArray[i].books[j].title + "\n");
            }
        }
    }
}

// Displays list of commands
function getHelp(client) {
    client.write(colors.bold("Books App Instructions"));
    client.write("\n\nTo create an account & log in:\n\n\t'new_user [username]' - Create a new account with a one word username\n\t'user [username]' - Log in to existing account\n\nOther commands:\n\n\t'add [book title]' - Add a book to your list\n\t'my_books' - Display all your recommended books\n\t'view_recommended' - Display all books recommended by other users\n\t'log_out' - Log out of the application\n\t'help' - Display all commands\n")
}

// Logs a user out & ends connection
function logOut(client) {
    client.write(colors.bold("Goodbye " + username + "!\n"));
    user = undefined;
    username = undefined;
    client.end();
}


server.listen(8124, function() { //'listening' listener
    console.log('Connected to Server!');
});