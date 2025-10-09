/*
  # Criar Storage Bucket para Avatares

  1. Criar bucket `avatars` para armazenar fotos de perfil
  2. Configurar políticas públicas para leitura
  3. Configurar políticas para upload autenticado
*/

-- Criar o bucket para avatars (execute apenas se ainda não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Qualquer um pode ver avatares
CREATE POLICY "Avatares são públicos para visualização"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Política: Usuários autenticados podem fazer upload
CREATE POLICY "Usuários autenticados podem fazer upload de avatares"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- Política: Usuários podem atualizar seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus próprios avatares"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

-- Política: Usuários podem deletar seus próprios avatares
CREATE POLICY "Usuários podem deletar seus próprios avatares"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
