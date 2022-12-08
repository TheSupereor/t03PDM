import { useState, useEffect, useContext } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { Session } from '@supabase/supabase-js'
import { StateContext } from '../context/userContext'

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [endereco, setEndereco] = useState('');
  const [zap, setZap] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [session, setSession] = useState<Session | null>(null);
  const context = useContext(StateContext);
  console.log(context);

  // ao carregar a página, pegar dados do usuário
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session) getProfile();
    console.log(session);
  }, [session])

  // Pegando dados pelo supabase
  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('Não há usuário logado!')

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, endereco, zap, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setEndereco(data.endereco)
        setZap(data.zap)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // atualizando dados
  async function updateProfile({
    username,
    endereco,
    zap,
    avatar_url,
  }: {
    username: string
    endereco: string
    zap: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('Não há usuário logado!')

      const updates = {
        id: session?.user.id,
        username,
        endereco,
        zap,
        avatar_url,
        updated_at: new Date(),
      }

      // fazendo o upsert dos dados no database
      let { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled autoCompleteType={undefined} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} autoCompleteType={undefined} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Endereço" value={endereco || ''} onChangeText={(text) => setEndereco(text)} autoCompleteType={undefined} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Zap" value={zap || ''} onChangeText={(text) => setZap(text)} autoCompleteType={undefined} />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, endereco, zap, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})