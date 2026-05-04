import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { OnboardingService } from '../../../../../core/services/utils/onboarding.service';

@Component({
  selector: 'app-help-button',
  imports: [ButtonModule],
  template: `
    <button
      class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white cursor-pointer bg-transparent border-none"
      title="Aide"
      (click)="handleClick()"
    >
      <i class="pi pi-question-circle text-lg"></i>
    </button>
  `,
  styles: ``,
})
export class HelpbuttonComponent {
  private onboardingService = inject(OnboardingService);
  handleClick() {
    this.onboardingService.startTour(
      this.onboardingService.defaultExoxmlTourSteps(),
    );
  }
}
