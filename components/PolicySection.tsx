import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PolicySectionProps {
  title: string;
  body: string;
}

export default function PolicySection({ title, body }: PolicySectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#123924',
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: '#1c1c17',
    lineHeight: 20,
  },
});
