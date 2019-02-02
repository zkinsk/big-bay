require('dotenv').config()
var inquirer = require("inquirer");
var mysql = require("mysql");


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MY_PASS,
    database: "great_bay"
});

function greatBayAuction() {
    inquirer.prompt([
        {
            type: "list",
            name: "questionOne",
            message: "Welcome to Select Animals Incorporated. Please choose what you would like to do:",
            choices: ["Create a new auction", "Make a bid on a current auction", "Exit"]
        }

    ]).then(function(auction) {
        // console.log(auction.questionOne)
        if (auction.questionOne === "Create a new auction"){
            newAuctionItem();
        } 
        else if (auction.questionOne === "Make a bid on a current auction"){
            startBidding() 
        }else{ process.exit() }
    });
}

function validatePrice(price) {
    var reg = /^\d+$/;
    return reg.test(price) || "Price should be a number."
}

function run() {
    connection.query("SELECT * FROM auctions", function(err, res) {
        if (err) throw err;
        console.log(res);
        console.log("----------------------");
    });
}

function makeBid(animal, userBid) { 
    
    connection.query("SELECT ? FROM auctions", [animal], function(err, res) {
        if (err) throw err;
        currentBid = res.current_bid;
        if (userBid > currentBid) {
            "UPDATE auctions SET ? WHERE ?",
            [
                {
                    current_bid: userBid
                },
                {
                    item_name: animal
                }
            ]
        }
        else {
            console.log("Your bid is too low!");
        }
    });
}; //end of makeBid fn

function startBidding(){
    console.log("Preparing bid options...")
    connection.query("SELECT * FROM auctions", function(err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                name: "auctionList",
                message: "Select the item you would like to bid on:",
                choices: res
            }, {
                type: "input",
                name: "userBid",
                message: "What is your bid?",
                validate: validatePrice
            }
        ]).then(function(newBid){
            let bidItem = newBid.auctionList;
            let userBid = newBid.userBid;
            makeBid(bidItem, userBid);
        })
    });
}

function newAuctionItem(){
    console.log("Preparing a new auction...")
    inquirer.prompt([
        {
            type: "input",
            name: "newItem",
            message: "What are you putting up for auction?"
        }, {
            type: "input",
            name: "initialBid",
            message: "What is the asking price?",
            validate: validatePrice
        }

    ]).then(function(newAuction) {
        var newItem = newAuction.newItem;
                       
        
        var initialBid = newAuction.initialBid;
        var currentBid = initialBid;

        var query = connection.query("INSERT INTO auctions SET?", 
        {
            name: newItem,
            initial_bid: initialBid,
            current_bid: currentBid

        }, function(err, res) {
            if (err) throw err;
            console.log(query.sql)
        });

        run();
    });
}


//start the auction!
greatBayAuction();