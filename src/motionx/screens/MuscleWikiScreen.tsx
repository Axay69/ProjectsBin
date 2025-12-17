import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { showToast } from '../lib/toast';
import { getExercises, getFilters, MuscleWikiExerciseSummary } from '../lib/musclewiki';

export default function MuscleWikiScreen({ route }: any) {
    const navigation = useNavigation<any>();
    
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [results, setResults] = useState<MuscleWikiExerciseSummary[]>([]);
    const [filtersLoaded, setFiltersLoaded] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [difficulties, setDifficulties] = useState<string[]>([]);
    const [muscles, setMuscles] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);
    const [activeMuscles, setActiveMuscles] = useState<string[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Effect to handle navigation parameters from BodyMap
    useEffect(() => {
        if (route?.params?.filterMuscle) {
            const m = route.params.filterMuscle;
            console.log('Received filterMuscle:', m);
            
            // Set selections
            setSelectedMuscles([m]);
            setSelectedCategory(null);
            setSelectedDifficulty(null);
            
            // Set active filters immediately for the fetch
            setActiveMuscles([m]);
            setActiveCategory(null);
            setActiveDifficulty(null);
            
            // Trigger fetch
            fetchWithMuscle(m);
            
            // Clear params to prevent re-triggering
            navigation.setParams({ filterMuscle: undefined });
        } else {
            // Only load first page if no params (initial load)
            // But we need to be careful not to double load if we already have data?
            // Actually standard loadFirstPage is fine if no params.
            if (results.length === 0 && !loading) {
                loadFirstPage();
            }
        }
    }, [route?.params?.filterMuscle]);

    useEffect(() => {
        loadFilters();
        // loadFirstPage(); // Removed this from here, moved logic to param effect
    }, []);

    const fetchWithMuscle = async (muscle: string) => {
        setLoading(true);
        try {
            const res = await getExercises({
                muscles: [muscle],
                limit: 50,
                offset: 0,
            });
            setResults(res.results);
            setOffset(res.offset + res.count);
            setHasMore(res.results.length > 0 && res.offset + res.count < res.total);
        } catch (e) {
            showToast.error('Error', 'Failed to load exercises');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadFilters = async () => {
        try {
            const f = await getFilters();
            setCategories(f.categories.map(c => c.toLowerCase()));
            setDifficulties(f.difficulties.map(d => d.toLowerCase()));
            setMuscles(f.muscles);
            setFiltersLoaded(true);
        } catch (e) {
            setFiltersLoaded(true);
        }
    };

    const loadFirstPage = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await getExercises({ limit: 50, offset: 0 });
            setResults(res.results);
            setOffset(res.offset + res.count);
            setHasMore(res.results.length > 0 && res.offset + res.count < res.total);
        } catch (e) {
            showToast.error('Error', 'Failed to load exercises');
            console.error(e);
            
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        if (loading) return;
        setActiveCategory(selectedCategory);
        setActiveDifficulty(selectedDifficulty);
        setActiveMuscles(selectedMuscles);
        setLoading(true);
        try {
            console.log('applyFilters', selectedCategory, selectedDifficulty, selectedMuscles);
            const res = await getExercises({
                category: selectedCategory || undefined,
                difficulty: selectedDifficulty || undefined,
                muscles: selectedMuscles.length ? selectedMuscles : undefined,
                limit: 50,
                offset: 0,
            });
            setResults(res.results);
            setOffset(res.offset + res.count);
            setHasMore(res.results.length > 0 && res.offset + res.count < res.total);
        } catch (e) {
            showToast.error('Error', 'Failed to load exercises');
            console.error(e);

        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (loading || loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const res = await getExercises({
                category: activeCategory || undefined,
                difficulty: activeDifficulty || undefined,
                muscles: activeMuscles.length ? activeMuscles : undefined,
                limit: 50,
                offset,
            });
            setResults(prev => [...prev, ...res.results]);
            setOffset(res.offset + res.count);
            setHasMore(res.results.length > 0 && res.offset + res.count < res.total);
        } catch (e) {
            showToast.error('Error', 'Failed to load more');
        } finally {
            setLoadingMore(false);
        }
    };

    const toggleCategory = (cat: string) => {
        const v = selectedCategory === cat ? null : cat;
        setSelectedCategory(v);
    };

    const toggleDifficulty = (dif: string) => {
        const v = selectedDifficulty === dif ? null : dif;
        setSelectedDifficulty(v);
    };

    const toggleMuscle = (m: string) => {
        setSelectedMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
    };

    const renderResult = ({ item }: { item: MuscleWikiExerciseSummary }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('MuscleWikiDetail', { id: item.id })}
            style={{
                backgroundColor: '#0B0F14',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#1F2937',
                padding: 12,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <MaterialCommunityIcons name="book-open-page-variant" size={26} color="#9CA3AF" />
            <View style={{ marginLeft: 12}}>
                <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{item.id}</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{item.name}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={26} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
            <View style={{flex: 1, paddingHorizontal: 16, paddingTop: 8 , }}>
                <View>
                    <Text style={{ color: '#F9FAFB', fontWeight: '700', marginTop: 8 }}>Categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => toggleCategory('bodyweight')}
                                style={{ backgroundColor: selectedCategory === 'bodyweight' ? 'rgba(14,165,164,0.15)' : '#0F172A', borderColor: selectedCategory === 'bodyweight' ? '#0EA5A4' : '#1F2937', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 }}
                            >
                                <Text style={{ color: selectedCategory === 'bodyweight' ? '#0EA5A4' : '#E5E7EB' }}>Bodyweight</Text>
                            </TouchableOpacity>
                            {filtersLoaded && categories.filter(c => c !== 'bodyweight').map(cat => (
                                <TouchableOpacity key={cat}
                                    onPress={() => toggleCategory(cat)}
                                    style={{ backgroundColor: selectedCategory === cat ? 'rgba(14,165,164,0.15)' : '#0F172A', borderColor: selectedCategory === cat ? '#0EA5A4' : '#1F2937', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 }}
                                >
                                    <Text style={{ color: selectedCategory === cat ? '#0EA5A4' : '#E5E7EB' }}>{cat.replace('-', ' ')}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <Text style={{ color: '#F9FAFB', fontWeight: '700', marginTop: 12 }}>Difficulties</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        <View style={{ flexDirection: 'row' }}>
                            {['novice', 'beginner', 'intermediate', 'advanced'].map(dif => (
                                <TouchableOpacity key={dif}
                                    onPress={() => toggleDifficulty(dif)}
                                    style={{ backgroundColor: selectedDifficulty === dif ? 'rgba(14,165,164,0.15)' : '#0F172A', borderColor: selectedDifficulty === dif ? '#0EA5A4' : '#1F2937', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 }}
                                >
                                    <Text style={{ color: selectedDifficulty === dif ? '#0EA5A4' : '#E5E7EB', textTransform: 'capitalize' }}>{dif}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <Text style={{ color: '#F9FAFB', fontWeight: '700', marginTop: 12 }}>Muscles</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        <View style={{ flexDirection: 'row' }}>
                            {muscles.map(m => (
                                <TouchableOpacity key={m}
                                    onPress={() => toggleMuscle(m)}
                                    style={{ backgroundColor: selectedMuscles.includes(m) ? 'rgba(14,165,164,0.15)' : '#0F172A', borderColor: selectedMuscles.includes(m) ? '#0EA5A4' : '#1F2937', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 }}
                                >
                                    <Text style={{ color: selectedMuscles.includes(m) ? '#0EA5A4' : '#E5E7EB' }}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                        <TouchableOpacity onPress={() => { setSelectedCategory(null); setSelectedDifficulty(null); setSelectedMuscles([]); }} style={{ backgroundColor: '#1F2937', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 }}>
                            <Text style={{ color: '#F9FAFB' }}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={applyFilters} style={{ backgroundColor: '#0EA5A4', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
                            <Text style={{ color: '#0B0F14', fontWeight: '700' }}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>


                <View style={{ flex: 1, marginTop: 12, }}>
                    {loading ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <ActivityIndicator color="#0EA5A4" />
                            <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Loading exercises...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderResult}
                            contentContainerStyle={{ paddingBottom: 50 }}
                            onEndReachedThreshold={0.3}
                            showsVerticalScrollIndicator={false}
                            onEndReached={loadMore}
                            ListFooterComponent={loadingMore ? (
                                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                                    <ActivityIndicator color="#0EA5A4" />
                                </View>
                            ) : null}
                            ListEmptyComponent={() => (
                                <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>No exercises found</Text>
                            )}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
