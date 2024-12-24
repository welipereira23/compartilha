'use client';

import { useState, useRef } from 'react';
import Webcam from 'react-webcam';

interface FormData {
  nome: string;
  mae: string;
  pai: string;
  nascimento: string;
  rg: string;
  cpf: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    mae: '',
    pai: '',
    nascimento: '',
    rg: '',
    cpf: '',
  });
  const [fotos, setFotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const tirarFoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setFotos(prev => [...prev, imageSrc]);
      }
    }
  };

  const compartilharWhatsApp = () => {
    const mensagem = `
*Dados do Formulário:*
Nome: ${formData.nome}
Mãe: ${formData.mae}
Pai: ${formData.pai}
Data de Nascimento: ${formData.nascimento}
RG: ${formData.rg}
CPF: ${formData.cpf}
    `.trim();

    // Criar um link para compartilhar no WhatsApp
    const mensagemCodificada = encodeURIComponent(mensagem);
    const whatsappUrl = `whatsapp://send?text=${mensagemCodificada}`;

    // Abrir o WhatsApp
    window.location.href = whatsappUrl;

    // Depois que o WhatsApp abrir, compartilhar cada foto individualmente
    setTimeout(() => {
      fotos.forEach((foto) => {
        // Criar um elemento <a> temporário para download
        const link = document.createElement('a');
        link.href = foto;
        link.download = `foto-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }, 1000);
  };

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Formulário de Envio</h1>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nome da Mãe</label>
          <input
            type="text"
            name="mae"
            value={formData.mae}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nome do Pai</label>
          <input
            type="text"
            name="pai"
            value={formData.pai}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
          <input
            type="date"
            name="nascimento"
            value={formData.nascimento}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">RG</label>
          <input
            type="text"
            name="rg"
            value={formData.rg}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CPF</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </form>

      <div className="mt-6">
        <button
          onClick={() => setShowCamera(!showCamera)}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4"
        >
          {showCamera ? 'Fechar Câmera' : 'Abrir Câmera'}
        </button>

        {showCamera && (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded"
              videoConstraints={{
                facingMode: { exact: "environment" }
              }}
            />
            <button
              onClick={tirarFoto}
              className="mt-2 w-full bg-green-500 text-white p-2 rounded"
            >
              Tirar Foto
            </button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {fotos.map((foto, index) => (
            <img
              key={index}
              src={foto}
              alt={`Foto ${index + 1}`}
              className="w-full rounded"
            />
          ))}
        </div>

        <button
          onClick={compartilharWhatsApp}
          className="w-full bg-green-600 text-white p-2 rounded mt-6"
          disabled={fotos.length === 0}
        >
          Compartilhar no WhatsApp
        </button>
      </div>
    </main>
  );
} 