const puppeteer = require('puppeteer');

async function scrapeFalabella(query) {
    console.log(`Scraping Falabella for query: ${query}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://www.falabella.com.pe/falabella-pe/search?Ntt=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('a.pod-link', { timeout: 20000 });

    const results = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('a.pod-link'));
        return items.map(item => {
            const title = item.querySelector('.pod-subTitle')?.textContent.trim() || 'Sin Título';
            const subtitle = item.querySelector('.pod-title')?.textContent.trim();
            const price = item.querySelector('.prices-0 span')?.textContent.trim() || 'Sin Precio';
            const link = item.href || '#';
            const image = item.querySelector('picture img')?.src || '';
            return { title, subtitle, price, link, image, store: 'Falabella' };
        });
    });

    await browser.close();
    return results;
}

async function scrapeOechsle(query) {
    console.log(`Scraping Oechsle for query: ${query}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://busca.oechsle.pe/search?query=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.product', { timeout: 20000 });

    const results = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.product'));

        return items.map(item => {
            const title = item.querySelector('span.text.fz-15.fz-lg-17.prod-name')?.textContent.trim() || 'Sin Título';
            
            const priceElem = item.querySelector('span.text.fz-lg-15.fw-bold.BestPrice');
            const price = priceElem ? priceElem.textContent.trim() : 'Sin Precio';
            
            const link = item.querySelector('a.prod-image')?.href || '#';
            const image = item.querySelector('.productImage img')?.src || '';

            return { title, price, link, image, store: 'Oechsle' };
        });
    });

    await browser.close();
    return results;
}

async function scrapePlazaVea(query) {
    console.log(`Scraping Plaza Vea for query: ${query}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://www.plazavea.com.pe/search/?_query=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.Showcase__content', { timeout: 20000 });

    const results = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.Showcase__content'));

        return items.map(item => {
            const title = item.querySelector('.Showcase__name')?.textContent.trim() || 'Sin Título';

            const priceElem = item.querySelector('.Showcase__salePrice');
            
            const priceAttr = priceElem ? priceElem.getAttribute('data-price') : null;
            const priceText = priceElem ? priceElem.textContent.trim() : null;

            let price = 'Sin Precio';
            if (priceAttr) {
                price = `S/ ${parseFloat(priceAttr.replace(',', '')).toFixed(2)}`;
            } else if (priceText) {
                const match = priceText.match(/S\/\s*([\d,]+)/);
                if (match) {
                    price = `S/ ${parseFloat(match[1].replace(',', '')).toFixed(2)}`;
                }
            }

            const link = item.querySelector('.Showcase__link')?.href || '#';
            const image = item.querySelector('.Showcase__photo img')?.src || '';

            return { title, price, link, image, store: 'Plaza Vea' };
        });
    });

    await browser.close();
    return results;
}

function filterResults(results) {
    const unwantedKeywords = ['case', 'funda', 'cover',
         'protector', 'accesorio', 'cable',
          'cargador', 'charger', 'adaptador',
           'audífonos'];
    
    return results.filter(item => {
        const title = item.title.toLowerCase();
        return !unwantedKeywords.some(keyword => title.includes(keyword));
    });
}

async function scrapeAll(query) {
    const [falabellaResults, oechsleResults, plazaVeaResults] = await Promise.all([
        scrapeFalabella(query),
        scrapeOechsle(query),
        scrapePlazaVea(query)
    ]);

    return [
        ...filterResults(falabellaResults).slice(0, 4), 
        ...filterResults(oechsleResults).slice(0, 4),
        ...filterResults(plazaVeaResults).slice(0, 4)
    ];
}

async function comparePrices(query) {
    const [falabellaResults, oechsleResults, plazaVeaResults] = await Promise.all([
        scrapeFalabella(query),
        scrapeOechsle(query),
        scrapePlazaVea(query)
    ]);

    const filteredFalabella = filterResults(falabellaResults).sort((a, b) => parseFloat(a.price.replace(/[^\d.-]/g, '')) - parseFloat(b.price.replace(/[^\d.-]/g, ''))).slice(0, 1);
    const filteredOechsle = filterResults(oechsleResults).sort((a, b) => parseFloat(a.price.replace(/[^\d.-]/g, '')) - parseFloat(b.price.replace(/[^\d.-]/g, ''))).slice(0, 1);
    const filteredPlazaVea = filterResults(plazaVeaResults).sort((a, b) => parseFloat(a.price.replace(/[^\d.-]/g, '')) - parseFloat(b.price.replace(/[^\d.-]/g, ''))).slice(0, 1);

    return [
        ...filteredFalabella,
        ...filteredOechsle,
        ...filteredPlazaVea
    ];
}

module.exports = { scrapeAll, comparePrices };
