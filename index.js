// import { isValidMnemonic } from "@ethersproject/hdnode";
const { isValidMnemonic } = require("@ethersproject/hdnode");
const { ethers } = require("ethers");
const fs = require("fs");

const wordLists = [
  ["novel", "book", "wave"],
  ["general"],
  ["believe"],
  ["water"],
  ["wedding"],
  ["flip", "undo", "indoor", "outdoor"],
  ["fire", "copper"],
  ["sleep", "tired"],
  ["dog", "fan", "chase", "patrol"],
  ["inspire", "grow", "quote"],
  ["future", "fortune"],
  ["together", "combine", "blur", "put", "manage"],
];

function getAllCombinations(wordLists) {
  if (wordLists.length === 0) {
    return [[]];
  }

  const firstList = wordLists[0];
  const remainingLists = wordLists.slice(1);

  const combinations = [];
  const remainingCombinations = getAllCombinations(remainingLists);

  for (const word of firstList) {
    for (const combination of remainingCombinations) {
      combinations.push([word].concat(combination));
    }
  }

  return combinations;
}

const _provider = new ethers.providers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/3bbb91b1f88b440aa40fe94be6a37199"
);

const blacklist = fs.readFileSync("./badlist.txt", "utf8").split("\n");
const allCombs = getAllCombinations(wordLists);
const combinations = allCombs.filter((haha) => {
  const txt = haha.join(" ");
  return !blacklist.some((homo) => homo.includes(txt));
});

console.log(combinations.length);

for (const combination of combinations) {
  const phase = combination.join(" ");
  const isValid = isValidMnemonic(phase);
  if (isValid) {
    let mnemonicWallet = ethers.Wallet.fromMnemonic(phase);
    const _account = mnemonicWallet.connect(_provider);
    _account.getBalance().then((balance) => {
      const isNotZero = balance.gt(0);

      if (isNotZero) {
        console.log("FOUND IT; ", phase);
      } else {
        fs.appendFileSync("./badlist.txt", phase + "\n", "utf8");
      }
    });
  } else {
    fs.appendFileSync("./badlist.txt", phase + "\n", "utf8");
  }
}
