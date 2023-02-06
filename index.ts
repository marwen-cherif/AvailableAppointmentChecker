import puppeteer from 'puppeteer';
import Mailjet from 'node-mailjet';
import * as dotenv from 'dotenv';

dotenv.config();

const mailjet = Mailjet.apiConnect(
    process.env.API_KEY,
    process.env.API_SECRET
);

async function checkAvailability(): Promise<void> {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.seine-et-marne.gouv.fr/booking/create/48803/0');

    await page.click('#condition');
    await page.click('input[name="nextButton"]');

    try {
        await page.waitForFunction(
            'document.querySelector("body").innerText.includes("Il n\'existe plus de plage horaire libre pour votre demande de rendez-vous.")',
            {timeout: 1000}
        );
    } catch(error) {
        if (error.message.includes('1000ms exceeded')) {
            const request = mailjet
                .post("send", {'version': 'v3.1'})
                .request({
                    "Messages":[
                        {
                            "From": {
                                "Email": "marwen.cherif@gmail.com",
                                "Name": "Marwen"
                            },
                            "To": [
                                {
                                    "Email": "marwen.cherif@gmail.com",
                                    "Name": "Marwen"
                                }
                            ],
                            "Subject": "Créneau disponible.",
                            "TextPart": "My first Mailjet email",
                            "HTMLPart": "<h3>Un créneau est disponible sur le site <a href='https://www.seine-et-marne.gouv.fr/booking/create/48803/0'>https://www.seine-et-marne.gouv.fr/booking/create/48803/0</a>!</h3><br />May the delivery force be with you!",
                            "CustomID": "AppGettingStartedTest"
                        }
                    ]
                })
            request
                .then((result) => {
                    console.log(result.body)
                })
                .catch((err) => {
                    console.log(err.statusCode)
                })
        }
    }

    await browser.close();
}

checkAvailability();



