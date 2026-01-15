import { Participant, Team, ShuffleConfig, TeamAssignment, TEAM_NAMES, TEAM_COLORS } from '../types';

export class ShuffleService {
    /**
     * Main shuffle function that applies all constraints
     */
    public static shuffle(participants: Participant[], config: ShuffleConfig): TeamAssignment {
        const participantArray = Array.from(participants);

        if (participantArray.length === 0) {
            return { teams: [], diversityScore: 0, genderBalanceScore: 0 };
        }

        // Initialize teams
        const teams: Team[] = [];
        for (let i = 0; i < config.numTeams; i++) {
            teams.push({
                id: i,
                name: TEAM_NAMES[i % TEAM_NAMES.length],
                color: TEAM_COLORS[i % TEAM_COLORS.length],
                members: []
            });
        }

        // Calculate ideal team size
        const baseSize = Math.floor(participantArray.length / config.numTeams);
        const remainder = participantArray.length % config.numTeams;

        // Shuffle participants randomly first
        const shuffled = [...participantArray].sort(() => Math.random() - 0.5);

        // Apply constrained distribution
        if (config.balanceGender && config.genderBalanceWeight > 0.5) {
            this.distributeWithGenderBalance(shuffled, teams, baseSize, remainder);
        } else {
            this.distributeWithDiversityFocus(shuffled, teams, baseSize, remainder);
        }

        // Calculate scores
        const diversityScore = this.calculateDiversityScore(teams);
        const genderBalanceScore = this.calculateGenderBalanceScore(teams);

        return { teams, diversityScore, genderBalanceScore };
    }

    /**
     * Distribute participants prioritizing gender balance
     */
    private static distributeWithGenderBalance(
        participants: Participant[],
        teams: Team[],
        baseSize: number,
        remainder: number
    ): void {
        // Group by gender
        const genderGroups: { [key: string]: Participant[] } = {};
        participants.forEach(p => {
            if (!genderGroups[p.gender]) {
                genderGroups[p.gender] = [];
            }
            genderGroups[p.gender].push(p);
        });

        // Distribute each gender group evenly across teams
        Object.keys(genderGroups).forEach(gender => {
            const group = genderGroups[gender].sort(() => Math.random() - 0.5);
            let teamIndex = 0;

            group.forEach(participant => {
                // Find team with least members
                const targetTeam = teams.reduce((min, team) =>
                    team.members.length < min.members.length ? team : min
                );
                targetTeam.members.push(participant);
            });
        });
    }

    /**
     * Distribute participants prioritizing college diversity
     */
    private static distributeWithDiversityFocus(
        participants: Participant[],
        teams: Team[],
        baseSize: number,
        remainder: number
    ): void {
        // Group by college
        const collegeGroups: { [key: string]: Participant[] } = {};
        participants.forEach(p => {
            if (!collegeGroups[p.college]) {
                collegeGroups[p.college] = [];
            }
            collegeGroups[p.college].push(p);
        });

        // Distribute to maximize diversity - spread each college across different teams
        const colleges = Object.keys(collegeGroups);
        colleges.forEach(college => {
            const group = collegeGroups[college].sort(() => Math.random() - 0.5);

            // Round-robin distribution across teams
            group.forEach((participant, index) => {
                const teamIndex = index % teams.length;
                teams[teamIndex].members.push(participant);
            });
        });

        // Rebalance team sizes if needed
        this.rebalanceTeamSizes(teams, baseSize, remainder);
    }

    /**
     * Rebalance team sizes to be as equal as possible
     */
    private static rebalanceTeamSizes(teams: Team[], baseSize: number, remainder: number): void {
        // Find teams that are too large or too small
        teams.sort((a, b) => b.members.length - a.members.length);

        while (teams[0].members.length > baseSize + 1) {
            const largestTeam = teams[0];
            const smallestTeam = teams[teams.length - 1];

            if (smallestTeam.members.length < baseSize) {
                // Move one member from largest to smallest
                const member = largestTeam.members.pop();
                if (member) {
                    smallestTeam.members.push(member);
                }
                teams.sort((a, b) => b.members.length - a.members.length);
            } else {
                break;
            }
        }
    }

    /**
     * Calculate diversity score (0-100)
     * Higher score = better college diversity within teams
     */
    private static calculateDiversityScore(teams: Team[]): number {
        let totalScore = 0;

        teams.forEach(team => {
            const colleges = new Set(team.members.map(m => m.college));
            const diversityRatio = colleges.size / team.members.length;
            totalScore += diversityRatio;
        });

        return Math.round((totalScore / teams.length) * 100);
    }

    /**
     * Calculate gender balance score (0-100)
     * Higher score = better gender distribution across teams
     */
    private static calculateGenderBalanceScore(teams: Team[]): number {
        if (teams.length === 0) return 0;

        let totalScore = 0;

        teams.forEach(team => {
            const genderCounts: { [key: string]: number } = {};
            team.members.forEach(m => {
                genderCounts[m.gender] = (genderCounts[m.gender] || 0) + 1;
            });

            const genderValues = Object.values(genderCounts);
            if (genderValues.length === 0) {
                totalScore += 0;
            } else {
                const max = Math.max(...genderValues);
                const min = Math.min(...genderValues);
                const balance = team.members.length > 0 ? (min / max) : 0;
                totalScore += balance;
            }
        });

        return Math.round((totalScore / teams.length) * 100);
    }
}
