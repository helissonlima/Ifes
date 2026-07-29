// ROLLBACK "seguro": se a própria chamada de ROLLBACK falhar (ex.: conexão já
// caiu), não deixa esse erro secundário mascarar o erro original que causou
// a transação a ser abortada.
async function rollback(client) {
  try {
    await client.query('ROLLBACK');
  } catch (err) {
    console.error('Falha ao executar ROLLBACK:', err);
  }
}

module.exports = { rollback };
