import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PolicySectionProps {
  title: string;
  body: string;
  isLast?: boolean;
}

function PolicySection({ title, body, isLast }: PolicySectionProps) {
  return (
    <View style={[styles.container, isLast && styles.containerLast]}>
      <View style={styles.titleRow}>
        <View style={styles.indicatorBar} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EEE6',
  },
  containerLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#3FA86B',
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
  },
  body: {
    fontSize: 13.5,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
    lineHeight: 22,
  },
});

export default memo(PolicySection);
