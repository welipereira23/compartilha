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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [numeroWhatsApp, setNumeroWhatsApp] = useState('');
  const [mostrarNumero, setMostrarNumero] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const novasfotos = Array.from(files);
      
      // Comprimir e converter as fotos para um tamanho menor
      const fotosProcessadas = await Promise.all(
        novasfotos.map(async (foto) => {
          const compressedBlob = await comprimirFoto(foto);
          return new File([compressedBlob], foto.name, { type: 'image/jpeg' });
        })
      );
      
      setFotos(prev => [...prev, ...fotosProcessadas]);
      
      // Criar URLs para preview
      const novosPreview = fotosProcessadas.map(foto => URL.createObjectURL(foto));
      setFotosPreview(prev => [...prev, ...novosPreview]);
    }
  };

  const comprimirFoto = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Redimensionar se a imagem for muito grande
          const MAX_SIZE = 1024;
          if (width > height && width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => resolve(blob!),
            'image/jpeg',
            0.7 // qualidade da compressão
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removerFoto = (index: number) => {
    URL.revokeObjectURL(fotosPreview[index]); // Limpar URL objeto
    setFotos(prev => prev.filter((_, i) => i !== index));
    setFotosPreview(prev => prev.filter((_, i) => i !== index));
  };

  const compartilharWhatsApp = async () => {
    if (!numeroWhatsApp) {
      setMostrarNumero(true);
      return;
    }

    try {
      // Criar texto da mensagem
      const partes = [
        '*Dados do Formulário:*',
        formData.nome && `Nome: ${formData.nome}`,
        formData.mae && `Mãe: ${formData.mae}`,
        formData.pai && `Pai: ${formData.pai}`,
        formData.nascimento && `Data de Nascimento: ${formData.nascimento}`,
        formData.rg && `RG: ${formData.rg}`,
        formData.cpf && `CPF: ${formData.cpf}`
      ].filter(Boolean);

      const mensagem = partes.join('\n');

      // Formatar o número do WhatsApp (remover caracteres não numéricos)
      const numeroFormatado = numeroWhatsApp.replace(/\D/g, '');
      
      // Criar o link do WhatsApp com o número e a mensagem
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${numeroFormatado}&text=${encodeURIComponent(mensagem)}`;
      window.open(whatsappUrl, '_blank');

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

        {mostrarNumero && (
          <div>
            <label className="block text-sm font-medium mb-1">Número do WhatsApp (com DDD)</label>
            <input
              type="tel"
              value={numeroWhatsApp}
              onChange={(e) => setNumeroWhatsApp(e.target.value)}
              placeholder="Ex: 11999999999"
              className="w-full p-2 border rounded"
            />
          </div>
        )}
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
          {mostrarNumero ? 'Enviar' : 'Compartilhar no WhatsApp'}
        </button>
      </div>
    </main>
  );
} 