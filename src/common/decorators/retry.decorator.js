/**
 * Decorator que tenta executar um método assíncrono múltiplas vezes em caso de falha.
 * @param {object} options - Opções de configuração.
 * @param {number} options.retries - O número de tentativas (ex: 3).
 * @param {number} options.delay - O atraso em milissegundos entre as tentativas (ex: 200).
 */
export function Retry(options) {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const { retries, delay } = options;
      for (let i = 0; i <= retries; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          if (i === retries) {
            console.error(`Método '${propertyKey}' falhou após ${retries} tentativas.`);
            throw error;
          }

          console.warn(`Método '${propertyKey}' falhou. Tentando novamente em ${delay}ms... (Tentativa ${i + 1} de ${retries})`);
          await new Promise(res => setTimeout(res, delay));
        }
      }
    };

    return descriptor;
  };
}