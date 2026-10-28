// Settlement transfers from the built bundle must always add up to the exact cent.
const assert = require('assert');
const src = require('fs').readFileSync(require('path').join(__dirname, '../dist/assets/app.js'), 'utf8');
const start = src.indexOf('function jv(e)');
const jv = new Function(src.slice(start, src.indexOf('}function ', start) + 1) + ';return jv')();
const row = (player_name, buy_in, cash_out) => ({ player_name, buy_in, cash_out });
const cents = r => Math.round(r.transfers.reduce((a, t) => a + t.amount, 0) * 100);

// Unbalanced evening (+4.75 surplus split over two winners): loser pays exactly 30.00.
assert.strictEqual(cents(jv([row('A', 40, 70), row('B', 30.5, 35.25), row('C', 20, 20), row('D', 40, 10)])), 3000);
// Shortfall split over three losers: winner receives exactly 31.00.
assert.strictEqual(cents(jv([row('A', 20, 51), row('B', 20, 10), row('C', 20, 10), row('D', 20, 9)])), 3100);
// Balanced evening is unchanged.
assert.deepStrictEqual(jv([row('A', 20, 55.5), row('B', 40, 4.5), row('C', 20, 20)]).transfers, [{ from: 'B', to: 'A', amount: 35.5 }]);
console.log('PASS: settlement transfers balance to the cent for surplus, shortfall and balanced evenings.');
