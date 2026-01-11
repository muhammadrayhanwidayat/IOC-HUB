const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Could not connect to database', err);
        process.exit(1);
    }
    console.log('✓ Connected to database');
});

db.serialize(() => {
    // 1. Find all backup tables
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup'", (err, tables) => {
        if (err) {
            console.error('❌ Error listing tables:', err);
            db.close();
            return;
        }

        if (tables.length === 0) {
            console.log('✓ No backup tables found. Database seems clean.');
            db.close();
        } else {
            console.log(`! Found ${tables.length} backup tables:`, tables.map(t => t.name).join(', '));

            let completed = 0;
            let hasError = false;

            tables.forEach((table) => {
                const tableName = table.name;
                db.run(`DROP TABLE IF EXISTS ${tableName}`, (err) => {
                    if (err) {
                        console.error(`❌ Failed to drop ${tableName}:`, err);
                        hasError = true;
                    } else {
                        console.log(`✓ Dropped table: ${tableName}`);
                    }

                    completed++;
                    if (completed === tables.length) {
                        console.log(hasError ? '⚠️ Cleanup finished with errors.' : '✓ Cleanup complete.');
                        db.close((err) => {
                            if (err) console.error('Error closing DB:', err);
                            else console.log('✓ Connection closed');
                        });
                    }
                });
            });
        }
    });
});
