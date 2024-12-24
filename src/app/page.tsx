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
  const [fotos, setFotos] = useState<Blob[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const iniciarCamera = async () => {
    try {
      setCameraReady(false);
      // Primeiro tenta a câmera traseira
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch {
        // Se não conseguir a câmera traseira, tenta qualquer câmera
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      alert('Erro ao acessar a câmera. Verifique as permissões.');
    }
  };

  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraReady(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const tirarFoto = () => {
    if (!cameraReady) {
      alert('Aguarde a câmera inicializar completamente');
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Configurar canvas com as dimensões do vídeo
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Capturar frame do vídeo
      const context = canvas.getContext('2d');
      if (context) {
        // Se o vídeo estiver espelhado, espelhar o canvas também
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.restore();
        
        // Converter para blob
        canvas.toBlob((blob) => {
          if (blob) {
            const novaFoto = URL.createObjectURL(blob);
            setFotos(prev => [...prev, blob]);
            setFotosPreview(prev => [...prev, novaFoto]);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // Detectar quando o vídeo está realmente pronto
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        setCameraReady(true);
      };
      video.addEventListener('canplay', handleCanPlay);
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [stream]);

  const removerFoto = (index: number) => {
    URL.revokeObjectURL(fotosPreview[index]); // Limpar URL objeto
    setFotos(prev => prev.filter((_, i) => i !== index));
    setFotosPreview(prev => prev.filter((_, i) => i !== index));
  };

  const compartilharWhatsApp = async () => {
    try {
      // Criar texto da mensagem
      const mensagem = `
*Dados do Formulário:*
Nome: ${formData.nome}
Mãe: ${formData.mae}
Pai: ${formData.pai}
Data de Nascimento: ${formData.nascimento}
RG: ${formData.rg}
CPF: ${formData.cpf}
      `.trim();

      // Tentar usar a Web Share API primeiro
      if (navigator.share) {
        try {
          const arquivos = fotos.map((foto, index) => 
            new File([foto], `foto_${index + 1}.jpg`, { type: 'image/jpeg' })
          );

          await navigator.share({
            text: mensagem,
            files: arquivos
          });
          return;
        } catch (error) {
          console.log('Erro no Web Share API, tentando método alternativo');
        }
      }

      // Fallback para intent do WhatsApp
      const intentUrl = `whatsapp://send?text=${encodeURIComponent(mensagem)}`;
      window.location.href = intentUrl;

      // Baixar as fotos automaticamente
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

  // Limpar recursos quando o componente for desmontado
  useEffect(() => {
    return () => {
      pararCamera();
      // Limpar URLs de preview
      fotosPreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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
          onClick={stream ? pararCamera : iniciarCamera}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4"
        >
          {stream ? 'Fechar Câmera' : 'Abrir Câmera'}
        </button>

        {stream && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <button
              onClick={tirarFoto}
              className={`mt-2 w-full ${cameraReady ? 'bg-green-500' : 'bg-gray-400'} text-white p-2 rounded`}
              disabled={!cameraReady}
            >
              {cameraReady ? 'Tirar Foto' : 'Aguarde...'}
            </button>
          </div>
        )}

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