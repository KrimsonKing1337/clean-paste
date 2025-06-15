import { execFile } from 'child_process';
import { promisify } from 'util';
import { access, readFile, writeFile } from 'fs/promises';
import path from 'path';

import png2icons, { BILINEAR } from 'png2icons';

const exec = promisify(execFile);

/**
 * @param {string} inputPath
 */
async function generateIcoAndIcns(inputPath) {
  const buf = await readFile(inputPath);

  const ico = png2icons.createICO(buf, BILINEAR, 0, false, false);
  const icns = png2icons.createICNS(buf, BILINEAR, 0);

  if (!ico || !icns) {
    throw new Error('Error: Could not create ico or icns');
  }

  const base = inputPath.replace(/\.[^.]+$/, '');

  await writeFile(`${base}.ico`, ico);
  await writeFile(`${base}.icns`, icns);
}

async function isImageMagickInstalled() {
  try {
    await exec('magick', ['-version']);

    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} inputPath
 */
async function generateIcons(inputPath) {
  const dir = path.dirname(inputPath);

  const isImageMagickInstalledResult = await isImageMagickInstalled();

  if (!isImageMagickInstalledResult) {
    console.error('ImageMagick (magick) does not install or there is no in PATH');

    process.exit(1);
  }

  try {
    // ICO
    await generateIcoAndIcns(inputPath);

    // PNGs
    const sizes = [
      {
        size: 32,
        name: '32x32',
      },
      {
        size: 128,
        name: '128x128',
      },
      {
        size: 256,
        name: '128x128@2x',
      },
      {
        size: 30,
        name: 'Square30x30Logo',
      },
      {
        size: 44,
        name: 'Square44x44Logo',
      },
      {
        size: 71,
        name: 'Square71x71Logo',
      },
      {
        size: 89,
        name: 'Square89x89Logo',
      },
      {
        size: 107,
        name: 'Square107x107Logo',
      },
      {
        size: 142,
        name: 'Square142x142Logo',
      },
      {
        size: 150,
        name: 'Square150x150Logo',
      },
      {
        size: 284,
        name: 'Square284x284Logo',
      },
      {
        size: 310,
        name: 'Square310x310Logo',
      },
      {
        size: 50,
        name: 'StoreLogo',
      },
    ];

    for (const { size, name } of sizes) {
      await exec('magick', [
        inputPath,
        '-resize',
        `${size}x${size}`,
        path.join(dir, `${name}.png`)
      ]);
    }

    console.log('Icons was generated successfully!');
  } catch (err) {
    console.error('Error while generating icons:', err.message || err);

    process.exit(1);
  }
}


const input = process.argv[2];

if (!input) {
  console.error('Define path to image. Example: node icon-generator.js icon.png');

  process.exit(1);
}

access(input)
  .then(() => generateIcons(input))
  .catch(() => {
    console.error(`File "${input}" is not found`);

    process.exit(1);
  });
