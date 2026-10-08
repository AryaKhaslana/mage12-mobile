const fs = require('fs');
let code = fs.readFileSync('components/dashboard/StatCard.tsx', 'utf-8');

const imports = `import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getMyNotifications } from '../../services/api';`;

code = code.replace(/import React from 'react';\s*import \{ View, Text, StyleSheet, Pressable \} from 'react-native';\s*import \{ MaterialIcons, Ionicons \} from '@expo\/vector-icons';\s*import \{ router \} from 'expo-router';/, imports);

const fetcher = `
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchNotif = async () => {
        try {
          const res = await getMyNotifications(1, 1);
          if (isActive) {
            setUnreadCount(res.meta?.unreadCount || 0);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchNotif();
      return () => {
        isActive = false;
      };
    }, [])
  );
`;

code = code.replace(
  /export default function StatCard\(\{ userData, tanamanCount, onBadgePress \}: \{ userData: any, tanamanCount: number, onBadgePress: \(\) => void \}\) \{/,
  `export default function StatCard({ userData, tanamanCount, onBadgePress }: { userData: any, tanamanCount: number, onBadgePress: () => void }) {${fetcher}`
);

code = code.replace(
  /<Text style=\{styles\.label\}>2 Baru<\/Text>/,
  `{unreadCount > 0 ? (
            <Text style={[styles.label, { color: '#FF6B5C', fontFamily: 'Nunito_700Bold' }]}>{unreadCount} Baru</Text>
          ) : (
            <Text style={styles.label}>Kosong</Text>
          )}`
);

fs.writeFileSync('components/dashboard/StatCard.tsx', code);
