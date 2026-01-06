<template>
  <UModal 
    v-model:open="isModalOpen"
    :dismissible="false" 
    title="Disclaimer & Terms of Use"
    description="Please read and accept the terms before continuing."
    :ui="{
      overlay: 'bg-gray-900/90 backdrop-blur-sm',
      content: 'w-full h-[100dvh] sm:w-[75vw] sm:h-[85vh] sm:max-w-4xl',
      body: 'flex-1 overflow-y-auto'
    }"
  >
    <!-- Empty default slot required for controlled modal without a trigger button -->
    <template #default></template>

    <template #header>
      <div class="flex flex-col gap-1">
        <h2 class="text-xl sm:text-2xl font-bold text-primary">
          Disclaimer & Terms of Use
        </h2>
        <p class="text-muted text-sm">Last Updated: January 3, 2026</p>
      </div>
    </template>

    <template #body>
      <div class="text-muted space-y-4">
        <section>
          <h3 class="text-lg font-semibold text-highlighted mb-2">Important Notice</h3>
          <p>
            <strong>NeuroEvolution: Stickman Fighters</strong> is provided as an experimental, demonstration application for exploratory and educational purposes. By using this application, you acknowledge and agree to the following terms:
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-default mb-1 font-mono uppercase text-xs tracking-wider">No Warranties</h4>
          <p class="text-sm">
            This software is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or accuracy.
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-default mb-1 font-mono uppercase text-xs tracking-wider">No Liability</h4>
          <p class="text-sm">
            The developer(s) shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of productivity, or personal injury arising from the use or inability to use this application.
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-default mb-1 font-mono uppercase text-xs tracking-wider">User Responsibility</h4>
          <p class="text-sm">
            You assume full responsibility for the use of this application, any consequences resulting from such use, and the security and backup of your data.
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-default mb-1 font-mono uppercase text-xs tracking-wider">Experimental Nature</h4>
          <p class="text-sm italic">
            The application may contain bugs, errors, or incomplete features. The developer(s) make no guarantees regarding functionality, performance, data persistence, or continued availability.
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-default mb-1 font-mono uppercase text-xs tracking-wider">Data Storage</h4>
          <p class="text-sm">
            All data (genomes, settings, etc.) is stored locally on your device using browser localStorage. We are not responsible for data loss due to browser settings or updates.
          </p>
        </section>

        <section>
          <p class="text-sm font-medium mt-6 border-t border-default pt-4">
            By clicking "Accept", you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, you must click "Decline".
          </p>
        </section>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-end">
        <UButton
          @click="handleDecline"
          color="neutral"
          variant="outline"
          class="w-full sm:w-auto"
        >
          Decline
        </UButton>
        <UButton
          @click="handleAccept"
          color="success"
          class="w-full sm:w-auto"
        >
          Accept & Continue
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

const props = defineProps<Props>();

// Modal open state - always starts open, never closes via v-model (only via callbacks)
const isModalOpen = ref(true);

// Note: Scroll lock is now managed centrally by useDisclaimer composable
// based on disclaimerStatus, ensuring consistent behavior across modal and farewell screen

const handleAccept = () => {
  isModalOpen.value = false;
  props.onAccept();
};

const handleDecline = () => {
  isModalOpen.value = false;
  props.onDecline();
};
</script>
