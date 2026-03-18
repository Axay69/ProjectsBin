import Sound from 'react-native-nitro-sound';

/**
 * SoundService provides a clean wrapper over NitroSound for playing sound effects.
 */
class SoundService {
    /**
     * Load and play a sound effect.
     * @param path The path to the sound file (can be a require() or a remote URL).
     */
    static async play(path: string | number) {
        try {
            // Note: NitroSound 0.x uses startPlayer or play depending on version
            // Based on user's prompt, Sound.startPlayer is used for long audio, 
            // but for simple SFX, we might use a dedicated method if available.
            // For now, we follow the provided singleton API.
            await Sound.startPlayer(path.toString());
        } catch (error) {
            console.error('[SoundService] Error playing sound:', error);
        }
    }

    /**
     * Play a specific sound effect with pre-defined paths.
     */
    static async playSuccess() {
        // Example: await this.play(require('../assets/sounds/success.mp3'));
    }

    static async playError() {
        // Example: await this.play(require('../assets/sounds/error.mp3'));
    }

    static async playClick() {
        // Example: await this.play(require('../assets/sounds/click.mp3'));
    }
}

export default SoundService;
