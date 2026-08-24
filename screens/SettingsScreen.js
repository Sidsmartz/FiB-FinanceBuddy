/**
 * screens/SettingsScreen.js — App settings accessible after onboarding.
 * Currently exposes currency selection so existing users can update it at any time.
 */
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useData } from '../context/DataContext';

const CURRENCIES = [
    // Major world currencies
    { symbol: '$', label: 'USD  $', name: 'US Dollar' },
    { symbol: '€', label: 'EUR  €', name: 'Euro' },
    { symbol: '£', label: 'GBP  £', name: 'British Pound' },
    { symbol: '₹', label: 'INR  ₹', name: 'Indian Rupee' },
    { symbol: '¥', label: 'JPY  ¥', name: 'Japanese Yen' },
    { symbol: '元', label: 'CNY 元', name: 'Chinese Yuan' },
    { symbol: 'A$', label: 'AUD A$', name: 'Australian Dollar' },
    { symbol: 'C$', label: 'CAD C$', name: 'Canadian Dollar' },
    { symbol: 'Fr', label: 'CHF Fr', name: 'Swiss Franc' },
    { symbol: 'kr', label: 'SEK kr', name: 'Swedish Krona' },
    { symbol: 'kr', label: 'NOK kr', name: 'Norwegian Krone' },
    { symbol: 'kr', label: 'DKK kr', name: 'Danish Krone' },
    { symbol: 'NZ$', label: 'NZD NZ$', name: 'New Zealand Dollar' },
    { symbol: 'S$', label: 'SGD S$', name: 'Singapore Dollar' },
    { symbol: 'HK$', label: 'HKD HK$', name: 'Hong Kong Dollar' },
    { symbol: 'NT$', label: 'TWD NT$', name: 'Taiwan Dollar' },
    { symbol: '₩', label: 'KRW ₩', name: 'South Korean Won' },
    { symbol: 'R$', label: 'BRL R$', name: 'Brazilian Real' },
    { symbol: '₺', label: 'TRY ₺', name: 'Turkish Lira' },
    { symbol: '₽', label: 'RUB ₽', name: 'Russian Ruble' },
    { symbol: 'Mex$', label: 'MXN Mex$', name: 'Mexican Peso' },
    { symbol: 'R', label: 'ZAR R', name: 'South African Rand' },
    { symbol: '₦', label: 'NGN ₦', name: 'Nigerian Naira' },
    // Asia
    { symbol: '₱', label: 'PHP ₱', name: 'Philippine Peso' },
    { symbol: '₫', label: 'VND ₫', name: 'Vietnamese Dong' },
    { symbol: '฿', label: 'THB ฿', name: 'Thai Baht' },
    { symbol: 'Rp', label: 'IDR Rp', name: 'Indonesian Rupiah' },
    { symbol: 'RM', label: 'MYR RM', name: 'Malaysian Ringgit' },
    { symbol: '₨', label: 'PKR ₨', name: 'Pakistani Rupee' },
    { symbol: '₨', label: 'LKR ₨', name: 'Sri Lankan Rupee' },
    { symbol: '৳', label: 'BDT ৳', name: 'Bangladeshi Taka' },
    { symbol: '₮', label: 'MNT ₮', name: 'Mongolian Tögrög' },
    { symbol: '₼', label: 'AZN ₼', name: 'Azerbaijani Manat' },
    { symbol: '֏', label: 'AMD ֏', name: 'Armenian Dram' },
    { symbol: '₾', label: 'GEL ₾', name: 'Georgian Lari' },
    { symbol: '₸', label: 'KZT ₸', name: 'Kazakhstani Tenge' },
    { symbol: '؋', label: 'AFN ؋', name: 'Afghan Afghani' },
    { symbol: 'Nu', label: 'BTN Nu', name: 'Bhutanese Ngultrum' },
    { symbol: '₭', label: 'LAK ₭', name: 'Lao Kip' },
    { symbol: 'K', label: 'MMK K', name: 'Myanmar Kyat' },
    { symbol: '៛', label: 'KHR ៛', name: 'Cambodian Riel' },
    // Europe
    { symbol: 'zł', label: 'PLN zł', name: 'Polish Złoty' },
    { symbol: 'Kč', label: 'CZK Kč', name: 'Czech Koruna' },
    { symbol: 'Ft', label: 'HUF Ft', name: 'Hungarian Forint' },
    { symbol: 'lei', label: 'RON lei', name: 'Romanian Leu' },
    { symbol: 'лв', label: 'BGN лв', name: 'Bulgarian Lev' },
    { symbol: '₴', label: 'UAH ₴', name: 'Ukrainian Hryvnia' },
    { symbol: 'kr', label: 'ISK kr', name: 'Icelandic Króna' },
    { symbol: 'kn', label: 'HRK kn', name: 'Croatian Kuna' },
    { symbol: 'din', label: 'RSD din', name: 'Serbian Dinar' },
    { symbol: 'Mk', label: 'BAM Mk', name: 'Bosnia-Herz. Mark' },
    { symbol: 'den', label: 'MKD den', name: 'Macedonian Denar' },
    { symbol: 'L', label: 'ALL L', name: 'Albanian Lek' },
    { symbol: '₼', label: 'MDL L', name: 'Moldovan Leu' },
    // Middle East
    { symbol: '₪', label: 'ILS ₪', name: 'Israeli Shekel' },
    { symbol: '﷼', label: 'SAR ﷼', name: 'Saudi Riyal' },
    { symbol: 'د.إ', label: 'AED د.إ', name: 'UAE Dirham' },
    { symbol: '﷼', label: 'IRR ﷼', name: 'Iranian Rial' },
    { symbol: 'IQD', label: 'IQD IQD', name: 'Iraqi Dinar' },
    { symbol: 'KD', label: 'KWD KD', name: 'Kuwaiti Dinar' },
    { symbol: 'BD', label: 'BHD BD', name: 'Bahraini Dinar' },
    { symbol: 'QR', label: 'QAR QR', name: 'Qatari Riyal' },
    { symbol: 'JD', label: 'JOD JD', name: 'Jordanian Dinar' },
    { symbol: 'OMR', label: 'OMR OMR', name: 'Omani Rial' },
    { symbol: 'LBP', label: 'LBP LBP', name: 'Lebanese Pound' },
    // Africa
    { symbol: 'LE', label: 'EGP LE', name: 'Egyptian Pound' },
    { symbol: 'MAD', label: 'MAD MAD', name: 'Moroccan Dirham' },
    { symbol: 'DZD', label: 'DZD DZD', name: 'Algerian Dinar' },
    { symbol: 'Ksh', label: 'KES Ksh', name: 'Kenyan Shilling' },
    { symbol: 'GH₵', label: 'GHS GH₵', name: 'Ghanaian Cedi' },
    { symbol: 'CFA', label: 'XOF CFA', name: 'W. African CFA' },
    { symbol: 'FCFA', label: 'XAF FCFA', name: 'C. African CFA' },
    { symbol: 'Br', label: 'ETB Br', name: 'Ethiopian Birr' },
    { symbol: 'TZS', label: 'TZS TZS', name: 'Tanzanian Shilling' },
    { symbol: 'UGX', label: 'UGX UGX', name: 'Ugandan Shilling' },
    { symbol: 'ZMW', label: 'ZMW ZMW', name: 'Zambian Kwacha' },
    { symbol: 'MZN', label: 'MZN MZN', name: 'Mozambican Metical' },
    { symbol: 'LSL', label: 'LSL LSL', name: 'Lesotho Loti' },
    // Americas
    { symbol: '$', label: 'ARS $', name: 'Argentine Peso' },
    { symbol: 'COP$', label: 'COP COP$', name: 'Colombian Peso' },
    { symbol: 'S/.', label: 'PEN S/.', name: 'Peruvian Sol' },
    { symbol: 'CLP$', label: 'CLP CLP$', name: 'Chilean Peso' },
    { symbol: 'Bs', label: 'VES Bs', name: 'Venezuelan Bolívar' },
    { symbol: 'G', label: 'GTQ G', name: 'Guatemalan Quetzal' },
    { symbol: 'Q', label: 'GTQ Q', name: 'Guatemalan Quetzal' },
    { symbol: 'B/.', label: 'PAB B/.', name: 'Panamanian Balboa' },
    { symbol: 'RD$', label: 'DOP RD$', name: 'Dominican Peso' },
    { symbol: 'J$', label: 'JMD J$', name: 'Jamaican Dollar' },
    { symbol: 'TT$', label: 'TTD TT$', name: 'Trinidad Dollar' },
    { symbol: '$b', label: 'BOB $b', name: 'Bolivian Boliviano' },
    { symbol: '₲', label: 'PYG ₲', name: 'Paraguayan Guaraní' },
    { symbol: '$U', label: 'UYU $U', name: 'Uruguayan Peso' },
    // Oceania
    { symbol: 'FJ$', label: 'FJD FJ$', name: 'Fijian Dollar' },
    { symbol: 'T$', label: 'TOP T$', name: 'Tongan Paʻanga' },
    { symbol: 'WS$', label: 'WST WS$', name: 'Samoan Tālā' },
    { symbol: 'K', label: 'PGK K', name: 'Papua New Guinea Kina' },
    // Crypto (popular)
    { symbol: '₿', label: 'BTC ₿', name: 'Bitcoin' },
    { symbol: 'Ξ', label: 'ETH Ξ', name: 'Ethereum' },
];

export default function SettingsScreen() {
    const { currency, setAppCurrency } = useData();
    const [selected, setSelected] = useState(currency);
    const [search, setSearch] = useState('');

    const filteredCurrencies = useMemo(() => {
        return CURRENCIES.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleSelect = (sym) => {
        setSelected(sym);
        setAppCurrency(sym);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Animatable.View animation="fadeIn" duration={400}>

                <Text style={styles.sectionTitle}>CURRENCY.</Text>
                <Text style={styles.sectionSubtitle}>
                    Choose the symbol shown next to all amounts in FiB.
                </Text>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search currency..."
                    placeholderTextColor="#444"
                    value={search}
                    onChangeText={setSearch}
                />

                <View style={styles.chipGrid}>
                    {filteredCurrencies.map((c, index) => (
                        <TouchableOpacity
                            key={`${c.symbol}-${index}`}
                            style={[styles.chip, selected === c.symbol && styles.chipSelected]}
                            onPress={() => handleSelect(c.symbol)}
                        >
                            <Text style={[styles.chipText, selected === c.symbol && styles.chipTextSelected]}>
                                {c.label}
                            </Text>
                            {selected === c.symbol && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.hint}>Changes apply immediately across all screens.</Text>

            </Animatable.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    content: {
        padding: 24,
        paddingTop: 32,
    },
    sectionTitle: {
        color: '#ffffff',
        fontFamily: 'PixelFont',
        fontSize: 14,
        letterSpacing: 2,
        marginBottom: 8,
    },
    sectionSubtitle: {
        color: '#666666',
        fontFamily: 'UbuntuMono',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 28,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        borderWidth: 1,
        borderColor: '#333333',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0a0a0a',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: '44%',
        flex: 1,
    },
    chipSelected: {
        borderColor: '#4a9eff',
        backgroundColor: '#0d1a2e',
    },
    chipText: {
        color: '#666666',
        fontFamily: 'UbuntuMono',
        fontSize: 13,
        flex: 1,
    },
    chipTextSelected: {
        color: '#4a9eff',
    },
    checkmark: {
        color: '#4a9eff',
        fontFamily: 'UbuntuMono',
        fontSize: 12,
    },
    hint: {
        color: '#444444',
        fontFamily: 'UbuntuMono',
        fontSize: 11,
        marginTop: 24,
        textAlign: 'center',
    },
});
