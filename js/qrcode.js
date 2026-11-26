// Monta o endereço da página pública do cardápio.
const endereco = window.location.origin + '/index.html';
document.getElementById('endereco-site').value = endereco;
 
document.getElementById('gerar').addEventListener('click', function() {
  const area = document.getElementById('qrcode');
  area.innerHTML = ''; // Apaga o QR Code anterior, se existir.
 
  // Cria uma imagem QR com o endereço do cardápio.
  new QRCode(area, {
    text: endereco,
    width: 220,
    height: 220
  });
 
  document.getElementById('mensagem-qrcode').textContent =
    'QR Code criado. Teste com a câmera do celular antes de imprimir.';
});
