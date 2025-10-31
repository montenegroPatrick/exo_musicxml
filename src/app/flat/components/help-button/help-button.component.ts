import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { OnboardingService } from '../../../../core/services/utils/onboarding.service';

@Component({
  selector: 'app-help-button',
  imports: [ButtonModule],
  template: `
    <p-button
      icon="pi pi-question-circle"
      size="large"
      styleClass="p-1!"
      (click)="handleClick()"
    ></p-button>
  `,
  styles: ``,
})
export class HelpbuttonComponent {
  private onboardingService = inject(OnboardingService);
  handleClick() {
    this.onboardingService.startTour(
      this.onboardingService.defaultExoxmlTourSteps()
    );
  }
}
