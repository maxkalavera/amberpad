const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')

const pkg = JSON.parse(readFileSync(resolve('./package.json'), { encoding: 'utf8' }));

module.exports = {
  appId: pkg.name,
  productName: pkg.productName,
  asar: true,
  npmRebuild: true,
  directories: {
    output: "distribution/"
  },
  linux: {
    // "icon": "./resources/linux/icons/",
    target: [
      {
        target: "deb",
        arch: pkg.build.architectures.linux
      },
    ],
    category: "Utility",
    synopsis: pkg.package,
    artifactName: pkg.productName + "${productName}-${os}-${arch}.${ext}",
    desktop: {
      Name: pkg.productName,
      Type: "Application",
      Comment: pkg.description,
      Terminal: "false"
    }
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: pkg.build.architectures.mac
      }
    ],
    category: "public.app-category.productivity",
    darkModeSupport: false,
    // entitlements: "./resources/mac/entitlements.plist",
    //entitlementsInherit: "./resources/mac/entitlements.plist",
    gatekeeperAssess: false,
    hardenedRuntime: true,
    //"icon": "./resources/mac/icons/icon.icns",
    //notarize: { "teamId": "" }
    publish: ['github']
  },
  dmg: {
    artifactName: "${productName}-${os}-${arch}.${ext}",
    // background: "./resources/mac/background.png",
    contents: [
      {
        x: 396,
        y: 345,
        type: "link",
        path: "/Applications"
      },
      {
        x: 396,
        y: 110,
        type: "file"
      }
    ],
    window: {
      width: 640,
      height: 480
    }
  },
  win: {
    //"icon": "./resources/build/icon.ico",
    artifactName: "${productName}-${os}-${arch}.${ext}",
    target: [
      {
        target: "nsis",
        arch: pkg.build.architectures.win
      },
    ],
    "publisherName": pkg.author.name
  },
  nsis: {
    artifactName: "${productName}-${os}-${arch}.${ext}",
    oneClick: false,
    perMachine: false,
  },
  portable: {
    artifactName: "${productName}-${os}-${version}-portable.${ext}"
  }
};