// Julia Becker
// WDI - March 29, 2015
// W02/D05 Homework

var net = require('net');
var fs = require('fs');

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
  client.write("\nWelcome to the Books App!\nExisting users, please type 'user [your username]' to access your account.\nNew users, enter new_user [new username] to create a new account. To log out, type 'log_out'>\n");

  client.on('data', function(stringFromClient) {
    inputArray = stringFromClient.split(' ');

    // Create new account
    if (inputArray[0] === "new_user" & inputArray.length === 2) {
        username = inputArray[1].trim();
        user = {username: username, books: []};

        userArray.push(user);
        save(userArray);

        client.write("Thanks " + username + "! Your account has successfully been created. To add a book you recommend, please type 'add [book name]'. Or to view recommended books across all users, type 'view_recommended'.\n");

    // New username too long or not given
    } else if (inputArray[0] === "new_user" & inputArray.length !== 2) {
        client.write("Please enter a one word username.\n");

    // Access existing user accounts
    } else if (inputArray[0] === "user" & inputArray.length > 1) {
        username = inputArray[1].trim();

        // Grab user data
        for (i = 0; i < userArray.length; i++) {
            if (username === userArray[i].username) {
                user = userArray[i];
                client.write("Welcome " + username + "!\nTo view all your recommended books, type 'my_books' in the console. Or if you would like to view books recommended by other users, type 'view_recommended'\n");
            } if (user === {}) {
                client.write("Sorry, it looks like that username doesn't exist. Create a new account by typing 'new_user [username]\n");
            }
        }

    // Add a book to your account
    } else if (inputArray[0] === "add" & inputArray.length > 1) {

        // Check that user signed in
        if (user === undefined) {
            client.write("Please sign in before adding books to your account. Type 'user [username] to access an existing account or 'new_user [username]' to create a new account.\n")

        // User is signed in - Add book to their list
        } else {
            var title = "";
            for (i = 1; i < inputArray.length; i++) {
                title += inputArray[i].trim() + " ";
            }
            var book = {title: title.trim()}
            user.books.push(book);

            // Save book to data file under user's account
            for (i = 0; i < userArray.length; i++) {
                if (userArray[i].username === user.username) {
                    userArray[i] = user;
                }
            }
            save(userArray);
            client.write(username + "-" + title + "has been added to your recommended books list.\n")
        }

    // View all books in your account
    } else if (inputArray[0] === "my_books\r\n") {

        client.write("\nYou recommend:\n\n")

        for (i = 0; i < userArray.length; i++) {
            if (userArray[i].username === username) { // Display only current users books
                var myBooks = userArray[i].books;
                for (j = 0; j < myBooks.length; j++) {
                    client.write(myBooks[j].title + "\n")
                }
            }
        }

    // View books across all users
    } else if (inputArray[0] === "view_recommended\r\n") {

        client.write("\nUsers recommend:\n\n")

        for (i = 0; i < userArray.length; i++) {
            if (userArray[i].username != username) { // Don't display current users books
                for (j = 0; j < userArray[i].books.length; j++) {
                    client.write(userArray[i].books[j].title + "\n");
                }
            }
        }

    // Log out (close connection)
    } else if (inputArray[0] === "log_out\r\n") {
        client.write("Goodbye " + username + "!\n");
        client.end();
    }

    });
});

server.listen(8124, function() { //'listening' listener
  console.log('Connected to Server!');
});

