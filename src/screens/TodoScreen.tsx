import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  ListRenderItem,
} from 'react-native';

interface Todo {
  id: string;
  title: string;
  done: boolean;
}

export default function TodoScreen() {
  const [title, setTitle] = useState<string>('');
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = () => {
    if (!title.trim()) return;
    const t: Todo = {
      id: Date.now().toString(),
      title: title.trim(),
      done: false,
    };
    setTodos(prev => [t, ...prev]);
    setTitle('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const removeTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const renderItem: ListRenderItem<Todo> = ({ item }) => (
    <View style={styles.item}>
      <Pressable onPress={() => toggleTodo(item.id)} style={styles.checkbox}>
        <View style={[styles.dot, item.done ? styles.dotOn : null]} />
      </Pressable>
      <Text style={[styles.itemText, item.done ? styles.itemTextDone : null]}>
        {item.title}
      </Text>
      <Pressable onPress={() => removeTodo(item.id)} style={styles.delete}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="New todo"
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          style={styles.add}
          onPress={addTodo}
        >
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>
      <FlatList<Todo>
        data={todos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  add: {
    backgroundColor: '#0a84ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#fff', fontWeight: '700' },
  list: { marginTop: 16, gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  itemText: { flex: 1, fontSize: 16 },
  itemTextDone: { textDecorationLine: 'line-through', color: '#888' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0a84ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotOn: { backgroundColor: '#0a84ff' },
  delete: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
  },
  deleteText: { color: '#fff', fontWeight: '700' },
});
