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
    var command = inputArray[0].trim();

    switch (command) {
        case 'new_user': // Create new account
            newUser(inputArray[1], client);
            break;
        case 'user':
            getUser(inputArray[1], client);
            break;
        case 'add':
            if (inputArray.length > 1) {
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
            }
            // } else {
            //     client.write("Please add a title for the book you'd like to add.")
            // }
            break;
        case 'my_books':
            client.write("\nYou recommend:\n\n")

            for (i = 0; i < userArray.length; i++) {
                if (userArray[i].username === username) { // Display only current users books
                    var myBooks = userArray[i].books;
                    for (j = 0; j < myBooks.length; j++) {
                        client.write(myBooks[j].title + "\n")
                    }
                }
            }
            break;
        case 'view_recommended':
            client.write("\nUsers recommend:\n\n")

            for (i = 0; i < userArray.length; i++) {
                if (userArray[i].username != username) { // Don't display current users books
                    for (j = 0; j < userArray[i].books.length; j++) {
                        client.write(userArray[i].books[j].title + "\n");
                    }
                }
            }
            break;
        case 'log_out':
            client.write("Goodbye " + username + "!\n");
            client.end();
            break;
    }
        });
});

function newUser(str, client) {
    if (inputArray.length === 2) {
        username = str.trim();
        user = {username: username, books: []};

        userArray.push(user);
        save(userArray);

        client.write("Thanks " + username + "! Your account has successfully been created. To add a book you recommend, please type 'add [book name]'. Or to view recommended books across all users, type 'view_recommended'.\n");

    } else if (inputArray.length !== 2) {
        client.write("Please enter a one word username.\n");
    }
}

function getUser(str, client) {
    if (inputArray.length > 1) {
        username = str.trim();

        for (i = 0; i < userArray.length; i++) {
            if (username === userArray[i].username) {
                user = userArray[i];
                    client.write("Welcome " + username + "!\nTo view all your recommended books, type 'my_books' in the console. Or if you would like to view books recommended by other users, type 'view_recommended'\n");
            } else if (user === {}) {
                client.write("Sorry, it looks like that username doesn't exist. Create a new account by typing 'new_user [username]\n");
            }
        }
    }
}


server.listen(8124, function() { //'listening' listener
  console.log('Connected to Server!');
});

