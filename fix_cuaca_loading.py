import re

with open('app/cuaca.tsx', 'r') as f:
    content = f.read()

replacement = '''  if (isLoading || !weatherData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.neutral }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }'''

content = content.replace(
'''  if (isLoading || !weatherData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.neutral }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }''', replacement)

with open('app/cuaca.tsx', 'w') as f:
    f.write(content)

print("Fixed loading state header in cuaca.tsx")
