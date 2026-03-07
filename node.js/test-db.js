const db = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('✅ Connexion MySQL réussie!');
        console.log('Résultat test:', rows[0].solution);
        
        // Tester la récupération des tables
        const [tables] = await db.query('SHOW TABLES');
        console.log('📊 Tables dans la base:');
        tables.forEach(table => console.log('   -', Object.values(table)[0]));
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
    } finally {
        process.exit();
    }
}

testConnection();