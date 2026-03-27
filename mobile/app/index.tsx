import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import type { Session } from '@supabase/supabase-js'
import {
  createSubscriptionCheckout,
  fetchSubscriptionStatus,
  sendChatMessage,
} from '../src/lib/api'
import { supabase } from '../src/lib/supabase'
import type {
  MobileChatUserContext,
  MobileSubscriptionStatusResponse,
} from '../src/lib/types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const DONATION_URL = 'https://iris-app.com/donate'

function newMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function newConversationId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function buildUserContext(session: Session): MobileChatUserContext {
  const email = session.user.email?.trim()
  const name = email && email.length > 0 ? email.split('@')[0] : 'Friend'
  return {
    name: name && name.length > 0 ? name : 'Friend',
    daysSober: 0,
    tone: 'warm',
    triggers: [],
  }
}

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  const [subscription, setSubscription] = useState<MobileSubscriptionStatusResponse | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [conversationId] = useState(newConversationId)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setLoadingSession(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const hasMobileAiAccess = subscription?.hasMobileAiAccess ?? false
  const platform = Platform.OS === 'android' ? 'android' : 'ios'
  const sessionToken = session?.access_token ?? null
  const canSend = Boolean(sessionToken && hasMobileAiAccess && input.trim()) && !sending

  const aiStatusLabel = useMemo(() => {
    if (!session) return 'Login required'
    if (loadingSubscription) return 'Checking subscription...'
    if (!hasMobileAiAccess) return 'Subscription required'
    return 'AI unlocked'
  }, [hasMobileAiAccess, loadingSubscription, session])

  async function refreshSubscription() {
    if (!sessionToken) {
      setSubscription(null)
      return
    }

    setLoadingSubscription(true)
    setSubscriptionError(null)

    try {
      const status = await fetchSubscriptionStatus(sessionToken)
      setSubscription(status)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load subscription.'
      setSubscriptionError(message)
    } finally {
      setLoadingSubscription(false)
    }
  }

  useEffect(() => {
    void refreshSubscription()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken])

  async function handleLogin() {
    setAuthLoading(true)
    setAuthError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setAuthLoading(false)

    if (error) {
      setAuthError(error.message)
      return
    }

    setPassword('')
  }

  async function handleCheckout() {
    if (!sessionToken) return
    setCheckoutLoading(true)
    setSubscriptionError(null)

    try {
      const checkout = await createSubscriptionCheckout(sessionToken, platform)
      if (!checkout.checkoutUrl) {
        throw new Error('No checkout URL returned.')
      }
      const canOpen = await Linking.canOpenURL(checkout.checkoutUrl)
      if (!canOpen) {
        throw new Error('Unable to open checkout URL on this device.')
      }
      await Linking.openURL(checkout.checkoutUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout.'
      setSubscriptionError(message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handleDonate() {
    const canOpen = await Linking.canOpenURL(DONATION_URL)
    if (canOpen) {
      await Linking.openURL(DONATION_URL)
    }
  }

  async function handleSendMessage() {
    const activeSession = session
    if (!sessionToken || !canSend || !activeSession) {
      return
    }

    const content = input.trim()
    setInput('')
    setChatError(null)
    setSending(true)

    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: newMessageId(), role: 'user', content },
    ]
    setMessages(nextMessages)

    try {
      const assistantReply = await sendChatMessage(
        sessionToken,
        platform,
        conversationId,
        content,
        buildUserContext(activeSession),
      )

      setMessages((prev) => [
        ...prev,
        { id: newMessageId(), role: 'assistant', content: assistantReply },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message.'
      if (message === 'MOBILE_SUBSCRIPTION_REQUIRED') {
        await refreshSubscription()
        setChatError('Subscription required. AI is disabled until subscription is active.')
      } else {
        setChatError(message)
      }
    } finally {
      setSending(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setMessages([])
    setInput('')
    setSubscription(null)
    setSubscriptionError(null)
    setChatError(null)
  }

  if (loadingSession) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0F' }}>
        <StatusBar style="light" />
        <ActivityIndicator color="#6B4CE6" />
      </View>
    )
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', padding: 24, justifyContent: 'center', gap: 12 }}>
        <StatusBar style="light" />
        <Text style={{ color: '#F0ECF9', fontSize: 28, fontWeight: '700' }}>IRIS Mobile</Text>
        <Text style={{ color: '#A8A3B8', fontSize: 15 }}>
          Login is always free. Mobile AI access is $2.99/month plus applicable tax.
        </Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#6B6780"
          style={{
            color: '#F0ECF9',
            borderColor: '#2A2A36',
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#6B6780"
          style={{
            color: '#F0ECF9',
            borderColor: '#2A2A36',
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
        {authError ? <Text style={{ color: '#ff6b6b' }}>{authError}</Text> : null}
        <Pressable
          onPress={handleLogin}
          disabled={authLoading}
          style={{
            backgroundColor: '#6B4CE6',
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: authLoading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#F0ECF9', fontWeight: '600' }}>
            {authLoading ? 'Signing in...' : 'Sign in'}
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}
    >
      <StatusBar style="light" />
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#F0ECF9', fontSize: 24, fontWeight: '700' }}>IRIS Mobile</Text>
          <Pressable
            onPress={handleLogout}
            style={{
              borderRadius: 10,
              borderColor: '#2A2A36',
              borderWidth: 1,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: '#F0ECF9', fontWeight: '600', fontSize: 12 }}>Log out</Text>
          </Pressable>
        </View>
        <Text style={{ color: '#A8A3B8' }}>Status: {aiStatusLabel}</Text>
      </View>

      <View style={{ backgroundColor: '#121218', borderRadius: 12, padding: 12, gap: 8 }}>
        <Text style={{ color: '#F0ECF9', fontSize: 16, fontWeight: '600' }}>
          Mobile AI Subscription
        </Text>
        <Text style={{ color: '#A8A3B8' }}>
          $2.99/month for AI chat features on mobile apps. Tax not included.
        </Text>
        {subscription?.subscription ? (
          <Text style={{ color: '#A8A3B8' }}>
            Current status: {subscription.subscription.status} · Renews:{' '}
            {subscription.subscription.currentPeriodEnd ?? 'n/a'}
          </Text>
        ) : (
          <Text style={{ color: '#A8A3B8' }}>No active mobile subscription found.</Text>
        )}
        {subscriptionError ? <Text style={{ color: '#ff6b6b' }}>{subscriptionError}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={handleCheckout}
            disabled={checkoutLoading}
            style={{
              flex: 1,
              backgroundColor: '#6B4CE6',
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
              opacity: checkoutLoading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: '#F0ECF9', fontWeight: '600' }}>
              {checkoutLoading ? 'Opening...' : 'Start subscription'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void refreshSubscription()}
            disabled={loadingSubscription}
            style={{
              flex: 1,
              backgroundColor: '#1A1A24',
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#F0ECF9', fontWeight: '600' }}>
              {loadingSubscription ? 'Refreshing...' : 'Refresh status'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={{ backgroundColor: '#121218', borderRadius: 12, padding: 12, gap: 8 }}>
        <Text style={{ color: '#F0ECF9', fontSize: 16, fontWeight: '600' }}>Keep the website free</Text>
        <Text style={{ color: '#A8A3B8' }}>
          Donations stay optional for visitors on the website. Mobile apps still require paid access for AI chat.
        </Text>
        <Pressable
          onPress={handleDonate}
          style={{
            backgroundColor: '#1A1A24',
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#F0ECF9', fontWeight: '600' }}>Donate via website</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: '#121218', borderRadius: 12, padding: 12, gap: 10 }}>
        <Text style={{ color: '#F0ECF9', fontSize: 16, fontWeight: '600' }}>AI Chat</Text>
        {!hasMobileAiAccess ? (
          <Text style={{ color: '#A8A3B8' }}>
            Login is available, but AI chat is disabled until your mobile subscription is active.
          </Text>
        ) : null}
        {messages.map((message) => (
          <View
            key={message.id}
            style={{
              backgroundColor: message.role === 'user' ? '#6B4CE6' : '#1A1A24',
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Text style={{ color: '#F0ECF9', fontWeight: '600', marginBottom: 4 }}>
              {message.role === 'user' ? 'You' : 'IRIS'}
            </Text>
            <Text style={{ color: '#F0ECF9' }}>{message.content}</Text>
          </View>
        ))}
        {chatError ? <Text style={{ color: '#ff6b6b' }}>{chatError}</Text> : null}
        <TextInput
          value={input}
          onChangeText={setInput}
          editable={hasMobileAiAccess && !sending}
          placeholder={
            hasMobileAiAccess
              ? 'Send a message to IRIS'
              : 'Subscription required for AI chat'
          }
          placeholderTextColor="#6B6780"
          style={{
            color: '#F0ECF9',
            borderColor: '#2A2A36',
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
        <Pressable
          onPress={handleSendMessage}
          disabled={!canSend}
          style={{
            backgroundColor: '#6B4CE6',
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
            opacity: canSend ? 1 : 0.45,
          }}
        >
          <Text style={{ color: '#F0ECF9', fontWeight: '600' }}>
            {sending ? 'Sending...' : 'Send'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
