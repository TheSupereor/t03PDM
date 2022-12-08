import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert, Button, Image } from 'react-native'
import DocumentPicker, { isCancel, isInProgress, types } from 'react-native-document-picker'

interface Props {
  size: number
  url: string | null
  onUpload: (filePath: string) => void
}

// criando um componente para pegar fotos do celular
export default function ImageComponent({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const avatarSize = { height: size, width: size }

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('images').download(path)

      if (error) {
        throw error
      }

      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => {
        setImageUrl(fr.result as string)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Erro ao baixar imagem: ', error.message)
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true)

      const file = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
        type: types.images,
        mode: 'open',
      })

      const photo = {
        uri: file.fileCopyUri,
        type: file.type,
        name: file.name,
      }

      const formData = new FormData()
      formData.append('file', photo as any)

      const fileExt = file!.name!.split('.').pop()
      const filePath = `${Math.random()}.${fileExt}`

      let { error } = await supabase.storage.from('images').upload(filePath, formData)

      if (error) {
        throw error
      }

      onUpload(filePath)
    } catch (error) {
      if (isCancel(error)) {
        console.warn('cancelled')
        // usuário cancelou
      } else if (isInProgress(error)) {
        console.warn('Apenas o último picker será aberto')
      } else if (error instanceof Error) {
        Alert.alert(error.message)
      } else {
        throw error
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <View>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} />
      )}
      <View>
        <Button
          title={uploading ? 'Enviando ...' : 'Enviado'}
          onPress={uploadAvatar}
          disabled={uploading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 5,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  image: {
    objectFit: 'cover',
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#333',
    border: '1px solid rgb(200, 200, 200)',
    borderRadius: 5,
  },
})