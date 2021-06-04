'use strict';
const fs = require('fs');
const readline = require('readline');
// popu-pref.csv ファイルから、ファイルを読み込みを行う Stream（ストリーム）を生成
const rs = fs.createReadStream('./popu-pref.csv');
// rl というオブジェクトも Stream のインタフェースを持っている
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// rl オブジェクトで line というイベントが発生したら この無名関数を呼んでください、という意味
rl.on('line', lineString => {
  const columns = lineString.split(',');
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
rl.on('close', () => {
  // 変化率の計算は、その県のデータが揃 ったあとでしか正しく行えないので、 以下のように close イベントの中へ実装する
  for (const [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }
  // Array.from(prefectureDataMap) の部分で、連想配列を普通の配列に変換する処理を行っている
  // 更に、Array の sort 関数に、比較関数として無名関数（アロー関数）を渡している
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });    
  const rankingStrings = rankingArray.map(([key, value]) => {
    return (
      key +
      ': ' +
      value.popu10 +
      '=>' +
      value.popu15 +
      ' 変化率:' +
      value.change
    );
  });
  console.log(rankingStrings);
});