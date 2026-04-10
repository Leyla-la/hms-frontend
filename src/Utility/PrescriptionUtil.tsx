export const frequencyToTimesPerDay = (freq: string) => {
    if (!freq) return 1;
    const map: Record<string, number> = {
        QD: 1, BID: 2, TID: 3, QID: 4,
        QHS: 1, QAM: 1, QOD: 0.5,
        Q4H: 6, Q6H: 4, Q8H: 3, Q12H: 2,
        AC: 1, PC: 1, PRN: 1, STAT: 1
    };
    return map[freq] ?? 1;
};

export const computeQuantityFromFrequencyAndDuration = (freq: string, duration: number) => {
    const times = frequencyToTimesPerDay(freq || '');
    const d = Number(duration || 1);
    return Math.max(1, Math.ceil(times * d));
};

const PrescriptionUtil = { frequencyToTimesPerDay, computeQuantityFromFrequencyAndDuration };
export default PrescriptionUtil;
