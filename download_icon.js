import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://r.jina.ai/i/698785014730/bc2193c0-b3ea-4959-83b1-91ff4a797297/4e650d32-8f9d-473d-815a-938221235948.png';
const dest = path.join(process.cwd(), 'public', 'porsh-pwa-icon.png');

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed.');
  });
}).on('error', (err) => {
  fs.unlink(dest);
  console.error('Error downloading:', err.message);
});
