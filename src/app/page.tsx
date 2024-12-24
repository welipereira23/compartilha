'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [isPWA, setIsPWA] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se está rodando como PWA
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const novasfotos = Array.from(files);
      setFotos(prev => [...prev, ...novasfotos]);
      
      // Criar URLs para preview
      const novosPreview = novasfotos.map(foto => URL.createObjectURL(foto));
      setFotosPreview(prev => [...prev, ...novosPreview]);
    }
  };

  const removerFoto = (index: number) => {
    URL.revokeObjectURL(fotosPreview[index]); // Limpar URL objeto
    setFotos(prev => prev.filter((_, i) => i !== index));
    setFotosPreview(prev => prev.filter((_, i) => i !== index));
  };

  const compartilharWhatsApp = async () => {
    try {
      // Criar texto da mensagem
      const mensagem = `
*Dados do Formulário:*${formData.nome ? `\nNome: ${formData.nome}` : ''}${formData.mae ? `\nMãe: ${formData.mae}` : ''}${formData.pai ? `\nPai: ${formData.pai}` : ''}${formData.nascimento ? `\nData de Nascimento: ${formData.nascimento}` : ''}${formData.rg ? `\nRG: ${formData.rg}` : ''}${formData.cpf ? `\nCPF: ${formData.cpf}` : ''}
      `.trim();

      // Se estiver rodando como PWA, tenta usar a Web Share API
      if (isPWA && navigator.share) {
        try {
          await navigator.share({
            text: mensagem,
            files: fotos
          });
          return;
        } catch (error) {
          console.log('Erro no Web Share API, tentando método alternativo');
        }
      }

      // Método alternativo
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(mensagem)}`;
      
      // Em PWA, podemos abrir em nova janela
      if (isPWA) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = whatsappUrl;
      }

      // Baixar as fotos
      fotos.forEach((foto, index) => {
        const url = URL.createObjectURL(foto);
        const a = document.createElement('a');
        a.href = url;
        a.download = `foto_${index + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao compartilhar. Por favor, tente novamente.');
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      {!isPWA && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            Para melhor experiência, instale o aplicativo clicando no botão "Adicionar à tela inicial" no seu navegador.
          </p>
        </div>
      )}

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
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFotoChange}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4"
        >
          Tirar Foto
        </button>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {fotosPreview.map((foto, index) => (
            <div key={index} className="relative">
              <img
                src={foto}
                alt={`Foto ${index + 1}`}
                className="w-full rounded"
              />
              <button
                onClick={() => removerFoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
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