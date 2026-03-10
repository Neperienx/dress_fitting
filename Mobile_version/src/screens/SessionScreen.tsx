import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { resolvePhotoUrl } from '../api/client';
import { fetchDefaultSessionDeck } from '../api/stores';
import { DEFAULT_SESSION_CARD_COUNT } from '../config';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SessionCard } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

export default function SessionScreen({ route }: Props) {
  const [cards, setCards] = useState<SessionCard[]>([]);
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const deck = await fetchDefaultSessionDeck();
      setCards(deck.slice(0, DEFAULT_SESSION_CARD_COUNT));
    })();
  }, [route.params.ownerEmail]);

  const current = cards[index];
  const done = index >= cards.length && cards.length > 0;

  const react = (liked: boolean) => {
    if (!current) {
      return;
    }
    if (liked) {
      setLikes((prev) => [...prev, current.photoPath]);
    } else {
      setDislikes((prev) => [...prev, current.photoPath]);
    }
    setIndex((prev) => prev + 1);
  };

  const summary = useMemo(() => ({ liked: likes.length, disliked: dislikes.length, total: cards.length }), [cards.length, dislikes.length, likes.length]);

  if (!current && !done) {
    return (
      <View style={styles.center}>
        <Text>Loading default session deck…</Text>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Session complete</Text>
        <Text>Liked: {summary.liked}</Text>
        <Text>Disliked: {summary.disliked}</Text>
        <Text>Total cards: {summary.total}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Card {index + 1} / {cards.length}
      </Text>
      <Image source={{ uri: resolvePhotoUrl(current?.photoPath) }} style={styles.image} resizeMode="cover" />
      <Text style={styles.caption}>{current?.fileName}</Text>
      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.dislike]} onPress={() => react(false)}>
          <Text style={styles.buttonText}>Dislike</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.like]} onPress={() => react(true)}>
          <Text style={styles.buttonText}>Like</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  progress: { color: '#6b7280', fontWeight: '600' },
  image: { flex: 1, borderRadius: 14, backgroundColor: '#f3f4f6' },
  caption: { fontSize: 16, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  dislike: { backgroundColor: '#ef4444' },
  like: { backgroundColor: '#16a34a' },
  buttonText: { color: 'white', fontWeight: '700' },
});
