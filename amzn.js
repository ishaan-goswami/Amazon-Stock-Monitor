const got = require('got');
const HTMLParser = require('node-html-parser');
const prompt = require('prompt-sync')();
const { Webhook, MessageBuilder } = require('discord-webhook-node');

//const productLink = "https://www.amazon.com/Flagship-HP-Chromebook-Anti-Glare-Processor/dp/B08JLKBRWB/ref=sr_1_3?keywords=hp%2B2020%2Bflagship%2B14%2Bchromebook%2Blaptop&qid=1678079663&sr=8-3, https://www.amazon.com/Panasonic-Headphones-On-Ear-Lightweight/dp/B08Q2D3XR1";

const hook = new Webhook("https://discord.com/api/webhooks/1082346534680657972/4xSwbeucAyqnf3_rdqOhsfFxO5Q4IRzbWdn_PCHy053NJCaPtoQ9PdoLayY5xza8-xtW");
const embed = new MessageBuilder()

.setTitle('Amazon Monitor')
.setColor('#90EE90')
.setTimestamp()

async function Monitor(productLink){
    var myheaders = {
        'connection': 'keep-alive', 
        'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"', 
        'sec-ch-ua-mobile': '?0', 
        'upgrade-insecure-requests': '1', 
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 
        'sec-fetch-site': 'same-origin', 
        'sec-fetch-mode': 'navigate', 
        'sec-fetch-user': '?1', 
        'sec-fetch-dest': 'document', 
        'accept-encoding': 'gzip, deflate, br', 
        'accept-language': 'en-US,en;q=0.9', 
        'rtt': '50', 
        'ect': '4g', 
        'downlink': '10'
    }

    const response = await got(productLink, {
        headers: myheaders
    });
    
    if(response && response.statusCode == 200){
        let root = HTMLParser.parse(response.body);
        let availabilityDiv = root.querySelector('#availability');
        if(availabilityDiv){
            let productImageURL = root.querySelector('#landingImage').getAttribute('src');
            let productName = productLink.substring(productLink.indexOf('com/') + 4, productLink.indexOf('/dp'));
            let stockText = availabilityDiv.childNodes[1].innerText.toLowerCase();
            if(stockText == 'out of stock'){
                console.log(productName + 'OUT OF STOCK');
            } else{
                embed.setThumbnail(productImageURL);
                embed.addField(productName, productLink, true);
                embed.addField('Availability', 'IN STOCK', false);
                hook.send(embed);
                console.log(productName + ': IN STOCK');
            }
        }
    }

    await new Promise(r => setTimeout(r, 5000));
    Monitor(productLink);
    return false;
}

async function Run(){
    var productLinks = prompt("Enter links to monitor (separate by comma): ");
    var productLinksArr = productLinks.split(',');
    for(var i = 0; i < productLinksArr.length; i++){
        productLinksArr[i] = productLinksArr[i].trim();
    }
    

    
    var monitors = [] //Array of Promises

    productLinksArr.forEach(link => {
        var p  = new Promise ((resolve, reject) => {
            resolve(Monitor(link));
        }).catch(err => console.log(err));

        monitors.push(p);
    })

    console.log('Now monitoring ' + productLinksArr.length + ' items');
    await Promise.allSettled(monitors);


}


Run();