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
        }else{ logout() }
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
        for (let x in res){
            console.log(`Item Name: ${res[x].name}  Current Bid: ${res[x].current_bid}\n`)
        }
        console.log("----------------------");
        greatBayAuction();
    });
}

function makeBid(animal, userBid) { 
    
    // connection.query("SELECT ? FROM auctions", [animal], function(err, res) 
    connection.query('SELECT * FROM `auctions` WHERE `name` = ?', [animal],function(err, res, fields){
        if (err) throw err;
        let currentBid = res[0].current_bid;
        // console.log("current bid: " + currentBid);
        // console.log("user bid: " + userBid); 
        if (userBid > currentBid) {
            console.log(`Congrats, you are now top bidder at \$${userBid}!`)
            connection.query("UPDATE auctions SET ? WHERE ?",
            [
                {
                    current_bid: userBid
                },
                {
                    name: animal
                }
            ],
            function(err, res){
                // console.log(res)
                greatBayAuction();
            });
        }
        else {
            console.log("Your bid is too low!")
            reStart(animal, userBid);
        }
    });
}; //end of makeBid fn



function startBidding(){
    console.log("Preparing bid options...")
    connection.query("SELECT * FROM auctions", function(err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "rawlist",
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
            let userBid = parseFloat(newBid.userBid);
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
                       
        
        var initialBid = parseFloat(newAuction.initialBid);
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
function reStart(animal, oldBid){
    inquirer.prompt([
        {
            type: "list",
            name: "goAgain",
            message: "Would you like to bid again?",
            choices: ["Yes", "No"]
        }
        ]).then(function(ans){
            if(ans.goAgain === "Yes"){
                console.log(`You need to bid more than \$${oldBid} for a ${animal}`)
                inquirer.prompt([
                    {
                        type: "input",
                        name: "userBid",
                        message: "What is your bid?",
                        validate: validatePrice
                    }
                ]).then(function(newBid){
                    let userBid = newBid.userBid;
                    makeBid(animal, userBid);
                })
            }else{ greatBayAuction() }
        })
}

function readTable(){
    // console.log("Selecting all products...\n");
    let animal = "Fish Bird"
    connection.query('SELECT * FROM `auctions` WHERE `name` = ?', [animal],function(err, res, fields) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log(res);
    //   console.log(fields);
      connection.end();
    });
}


function logout(){
    connection.end();
    process.exit();
}

//start the auction!
greatBayAuction();
// readTable();