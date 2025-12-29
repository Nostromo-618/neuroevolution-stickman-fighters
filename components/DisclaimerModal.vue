<template>
  <UModal :open="true" :ui="{ width: 'max-w-2xl' }" :dismissible="false">
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <UCard>
      <template #header>
        <div class="p-6 border-b border-slate-700 bg-slate-900/50">
          <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            Disclaimer & Terms of Use
          </h2>
          <p class="text-slate-400 text-sm mt-1">Last Updated: December 21, 2025</p>
        </div>
      </template>

      <div class="p-6 overflow-y-auto custom-scrollbar text-slate-300 space-y-4">
        <section>
          <h3 class="text-lg font-semibold text-white mb-2">Important Notice</h3>
          <p>
            <strong>NeuroEvolution: Stickman Fighters</strong> is provided as an experimental, demonstration application for exploratory and educational purposes. By using this application, you acknowledge and agree to the following terms:
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider">No Warranties</h4>
          <p class="text-sm">
            This software is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or accuracy.
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider">No Liability</h4>
          <p class="text-sm">
            The developer(s) shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of productivity, or personal injury arising from the use or inability to use this application.
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider">User Responsibility</h4>
          <p class="text-sm">
            You assume full responsibility for the use of this application, any consequences resulting from such use, and the security and backup of your data.
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider">Experimental Nature</h4>
          <p class="text-sm italic">
            The application may contain bugs, errors, or incomplete features. The developer(s) make no guarantees regarding functionality, performance, data persistence, or continued availability.
          </p>
        </section>

        <section>
          <h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider">Data Storage</h4>
          <p class="text-sm">
            All data (genomes, settings, etc.) is stored locally on your device using browser localStorage. We are not responsible for data loss due to browser settings or updates.
          </p>
        </section>

        <section>
          <p class="text-sm font-medium text-slate-400 mt-6 border-t border-slate-700/50 pt-4">
            By clicking "Accept", you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, you must click "Decline".
          </p>
        </section>
      </div>

      <template #footer>
        <div class="p-6 border-t border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <UButton
            @click="onDecline"
            color="neutral"
            variant="outline"
            class="w-full sm:w-auto"
          >
            Decline
          </UButton>
          <UButton
            @click="onAccept"
            color="success"
            class="w-full sm:w-auto"
          >
            Accept & Continue
          </UButton>
        </div>
      </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

defineProps<Props>();
</script>

