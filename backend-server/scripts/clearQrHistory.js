import pool from '../config/db.js';

async function main() {
  try {
    const [result] = await pool.execute('DELETE FROM qr_codes');
    console.log(`Deleted ${result.affectedRows} qr_codes rows from database`);
  } catch (err) {
    console.error('Error clearing qr_codes:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
