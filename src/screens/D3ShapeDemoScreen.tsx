import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import Svg, { Path, G, Circle } from 'react-native-svg';
import * as d3 from 'd3-shape';

interface DataPoint {
    x: number;
    y: number;
}

interface PieData {
    label: string;
    value: number;
    color: string;
}

const { width } = Dimensions.get('window');
const CHART_SIZE = width - 40;
const PADDING = 20;

const lineData: DataPoint[] = [
    { x: 0, y: 50 },
    { x: 50, y: 80 },
    { x: 100, y: 40 },
    { x: 150, y: 90 },
    { x: 200, y: 60 },
    { x: 250, y: 100 },
    { x: 300, y: 30 },
];

const pieData: PieData[] = [
    { label: 'React', value: 40, color: '#61dafb' },
    { label: 'Vue', value: 25, color: '#42b883' },
    { label: 'Angular', value: 20, color: '#dd0031' },
    { label: 'Svelte', value: 15, color: '#ff3e00' },
];

const stackedData = [
    { month: 'Jan', apples: 10, bananas: 20, cherries: 30 },
    { month: 'Feb', apples: 20, bananas: 30, cherries: 40 },
    { month: 'Mar', apples: 30, bananas: 10, cherries: 50 },
    { month: 'Apr', apples: 40, bananas: 20, cherries: 20 },
];

const radarData = [
    { axis: 'Strength', value: 80 },
    { axis: 'Speed', value: 60 },
    { axis: 'Agility', value: 90 },
    { axis: 'Stamina', value: 70 },
    { axis: 'Intelligence', value: 85 },
];

export default function D3ShapeDemoScreen() {
    const { styles, theme } = useStyles(stylesheet);

    // 1. Line Path Generator
    const lineGenerator = d3.line<DataPoint>()
        .x((d: DataPoint) => d.x)
        .y((d: DataPoint) => CHART_SIZE / 2 - d.y)
        .curve(d3.curveMonotoneX);

    const linePath = lineGenerator(lineData);

    // 2. Area Path Generator
    const areaGenerator = d3.area<DataPoint>()
        .x((d: DataPoint) => d.x)
        .y0(CHART_SIZE / 2)
        .y1((d: DataPoint) => CHART_SIZE / 2 - d.y)
        .curve(d3.curveMonotoneX);

    const areaPath = areaGenerator(lineData);

    // 3. Pie/Arc Generator
    const pieGenerator = d3.pie<PieData>().value((d: PieData) => d.value);
    const arcs = pieGenerator(pieData);
    const arcGenerator = d3.arc<any>()
        .innerRadius(CHART_SIZE / 4)
        .outerRadius(CHART_SIZE / 2 - 10)
        .cornerRadius(8)
        .padAngle(0.02);

    // 4. Scatter Plot (Symbols)
    const scatterPoints = lineData.map((d, i) => {
        const symbol = d3.symbol().type(i % 2 === 0 ? d3.symbolCircle : d3.symbolStar).size(100);
        return { path: symbol(), ...d };
    });

    // 5. Stacked Area
    const stackGenerator = d3.stack().keys(['apples', 'bananas', 'cherries']);
    const layers = stackGenerator(stackedData);
    const stackedAreaGenerator = d3.area<any>()
        .x((_: any, i: number) => (CHART_SIZE / (stackedData.length - 1)) * i)
        .y0((d: any) => CHART_SIZE / 2 - d[0])
        .y1((d: any) => CHART_SIZE / 2 - d[1])
        .curve(d3.curveBasis);

    // 6. Radar Chart (Radial)
    const radarAngleStep = (Math.PI * 2) / radarData.length;
    const radarRadius = CHART_SIZE / 2 - 40;
    const radarLineGenerator = d3.lineRadial<any>()
        .angle((_: any, i: number) => i * radarAngleStep)
        .radius((d: any) => (d.value / 100) * radarRadius)
        .curve(d3.curveLinearClosed);

    const radarPath = radarLineGenerator(radarData);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>D3 Shape Pro</Text>
                <Text style={styles.subHeader}>Advanced Mathematical UI Components</Text>

                {/* 1. Line Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Line Chart (MonotoneX)</Text>
                    <View style={styles.chartContainer}>
                        <Svg width={CHART_SIZE} height={CHART_SIZE / 2}>
                            <Path d={linePath || ''} stroke={theme.colors.primary} strokeWidth={3} fill="none" />
                        </Svg>
                    </View>
                </View>

                {/* 2. Area Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Area Chart (Filled)</Text>
                    <View style={styles.chartContainer}>
                        <Svg width={CHART_SIZE} height={CHART_SIZE / 2}>
                            <Path d={areaPath || ''} fill={theme.colors.primary} fillOpacity={0.2} />
                        </Svg>
                    </View>
                </View>

                {/* 3. Donut Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Donut Chart (Pie & Arcs)</Text>
                    <View style={styles.chartContainer}>
                        <Svg width={CHART_SIZE} height={CHART_SIZE}>
                            <G x={CHART_SIZE / 2} y={CHART_SIZE / 2}>
                                {arcs.map((arc: any, i: number) => (
                                    <Path key={i} d={arcGenerator(arc) || ''} fill={pieData[i].color} />
                                ))}
                            </G>
                        </Svg>
                    </View>
                </View>

                {/* 4. Scatter Plot */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Scatter Plot (Symbols)</Text>
                    <View style={styles.chartContainer}>
                        <Svg width={CHART_SIZE} height={CHART_SIZE / 2}>
                            {scatterPoints.map((p, i) => (
                                <G key={i} x={p.x} y={CHART_SIZE / 2 - p.y}>
                                    <Path d={p.path || ''} fill={theme.colors.accent} />
                                </G>
                            ))}
                        </Svg>
                    </View>
                </View>

                {/* 5. Stacked Area */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stacked Area (Basis Curve)</Text>
                    <View style={styles.chartContainer}>
                        <Svg width={CHART_SIZE} height={CHART_SIZE / 2}>
                            {layers.map((layer: any, i: number) => (
                                <Path
                                    key={i}
                                    d={stackedAreaGenerator(layer as any) || ''}
                                    fill={[theme.colors.primary, theme.colors.accent, theme.colors.error][i]}
                                    fillOpacity={0.6}
                                />
                            ))}
                        </Svg>
                    </View>
                </View>

                {/* 6. Radar Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Radar Chart (Radial Line)</Text>
                    <View style={styles.chartContainer}>
                        <Svg width={CHART_SIZE} height={CHART_SIZE}>
                            <G x={CHART_SIZE / 2} y={CHART_SIZE / 2}>
                                {/* Grid Circles */}
                                {[20, 40, 60, 80, 100].map(r => (
                                    <Circle key={r} r={(r / 100) * radarRadius} stroke={theme.colors.border} fill="none" strokeDasharray="4,4" />
                                ))}
                                <Path d={radarPath || ''} fill={theme.colors.primary} fillOpacity={0.3} stroke={theme.colors.primary} strokeWidth={2} />
                            </G>
                        </Svg>
                    </View>
                </View>

                <View style={styles.info}>
                    <Text style={styles.infoTitle}>Why D3-Shape?</Text>
                    <Text style={styles.infoText}>
                        D3-Shape handles the heavy math for complex SVG paths. Whether it's smoothing out lines or calculating arc angles for a pie chart, it provides a clean API that integrates perfectly with `react-native-svg`.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    header: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.typography,
    },
    subHeader: {
        fontSize: 16,
        color: theme.colors.subText,
        marginBottom: theme.spacing.xl,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.spacing.md,
    },
    chartContainer: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginTop: theme.spacing.md,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.accent,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.typography,
        lineHeight: 20,
    },
}));
