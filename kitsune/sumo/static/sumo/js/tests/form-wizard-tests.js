import { expect } from "chai";
import sinon from "sinon";
import { FormWizard, BaseFormStep } from "sumo/js/form-wizard";
import signInDoodleURL from "sumo/img/fox-doodle-sign-in.png";
import configureDoodleURL from "sumo/img/fox-doodle-configure.png";
import setupDoodleURL from "sumo/img/fox-doodle-setup.png";

/**
 * Basic form step element providing a minimal demonstration of how overriding
 * `template` and `render` can work in practice.
 */
class TestFormStep extends BaseFormStep {
  get template() {
    return `
      <template>
        <slot></slot>
        <p id="email"></p>
      </template>
    `;
  }

  render() {
    if (this.state.email) {
      let emailEl = this.shadowRoot.getElementById("email");
      emailEl.textContent = this.state.email;
    }
  }
}
customElements.define("test-form-step", TestFormStep);

describe("form-wizard custom element", () => {
  let wizard;
  let slot;

  function renderWizard() {
    $("body").empty().html(`
        <form-wizard>
          <test-form-step name="sign-into-fxa">
            <p>This is the first step.</p>
          </test-form-step>
          <test-form-step name="configure-sync">
            <p>This is the second step.</p>
          </test-form-step>
          <test-form-step name="setup-new-device">
            <p>This is the third step.</p>
          </test-form-step>
        </form-wizard>
    `);
    wizard = document.querySelector("form-wizard");
    slot = wizard.shadowRoot.querySelector('slot[name="active"]');
  }

  beforeEach(() => {
    renderWizard();
  });

  it("should render a form-wizard custom element", () => {
    expect(wizard).to.exist;
    expect(wizard).to.be.an.instanceof(FormWizard);
  });

  it("should show the first step by default", () => {
    let assignedElements = slot.assignedElements();
    let activeStep = assignedElements[0];
    expect(assignedElements.length).to.equal(1);
    expect(activeStep.getAttribute("name")).to.equal("sign-into-fxa");
    expect(activeStep.textContent.trim()).to.equal("This is the first step.");
  });

  describe("step change behavior", () => {
    const INITIAL_STEPS = [
      { name: "sign-into-fxa", status: "active", label: "First label" },
      { name: "configure-sync", status: "unavailable", label: "Second label" },
      { name: "setup-new-device", status: "unavailable", label: "Third label" },
    ];

    let oldInterpolate = global.interpolate;

    // Reset the active step before each test in this block.
    beforeEach(() => {
      global.interpolate = sinon.spy();
      wizard.steps = INITIAL_STEPS;
    });

    after(() => {
      global.interpolate = oldInterpolate;
    });

    it("should show a different step when the active step changes", () => {
      wizard.setStep("configure-sync", {});
      let assignedElements = slot.assignedElements();
      let activeStep = assignedElements[0];
      expect(assignedElements.length).to.equal(1);
      expect(activeStep.getAttribute("name")).to.equal("configure-sync");
      expect(activeStep.textContent.trim()).to.equal(
        "This is the second step."
      );
    });

    it("should show a progress bar that updates when the active step changes", () => {
      let progress = wizard.shadowRoot.querySelector("#progress");
      let indicator = progress.querySelector(".indicator");
      expect(progress).to.exist;
      expect(progress.getAttribute("aria-valuenow")).to.equal("1");
      expect(indicator.style.getPropertyValue("--progress")).to.equal("10%");

      wizard.activeStep = "configure-sync";
      expect(progress.getAttribute("aria-valuenow")).to.equal("2");
      expect(indicator.style.getPropertyValue("--progress")).to.equal("50%");

      wizard.activeStep = "setup-new-device";
      expect(progress.getAttribute("aria-valuenow")).to.equal("3");
      expect(indicator.style.getPropertyValue("--progress")).to.equal("100%");
    });

    it("should show an indicator of how many steps are in the form", () => {
      let indicator = wizard.shadowRoot.getElementById("step-indicator");
      let steps = indicator.children;
      expect(indicator).to.exist;
      expect(steps.length).to.equal(INITIAL_STEPS.length);

      [...steps].forEach((step, i) => {
        let subtitle = step.querySelector(".subtitle");
        let title = step.querySelector(".title");
        expect(step.getAttribute("status")).to.equal(INITIAL_STEPS[i].status);
        // Verifying that subtitle exists and that interpolate gets called as an
        // indirect way of testing the text content of the element.
        expect(subtitle).to.exist;
        expect(global.interpolate).to.have.been.calledWith("Step %s", [i + 1]);
        expect(title.textContent).to.equal(INITIAL_STEPS[i].label);
      });

      global.interpolate = oldInterpolate;
    });

    it("should update the statuses of the steps when the active step changes", () => {
      let indicator = wizard.shadowRoot.getElementById("step-indicator");
      let steps = indicator.children;
      expect(steps[0].getAttribute("status")).to.equal("active");
      expect(steps[1].getAttribute("status")).to.equal("unavailable");

      wizard.setStep("configure-sync", {});

      expect(steps[0].getAttribute("status")).to.equal("done");
      expect(steps[1].getAttribute("status")).to.equal("active");
    });

    describe("form wizard `setStep` method", () => {
      // <test-form-step> will display email on state change, allowing us to
      // easily verify the `render` method gets called.
      const MOCK_EMAIL = "tester@test.com";
      const EXPECTED_STEP_STATE = { email: MOCK_EMAIL };

      it("should update 'unavailable' steps to 'active' update step data", () => {
        const EXPECTED_WIZARD_STEPS = [
          { name: "sign-into-fxa", status: "done", label: "First label" },
          { name: "configure-sync", status: "active", label: "Second label" },
          {
            name: "setup-new-device",
            status: "unavailable",
            label: "Third label",
          },
        ];

        expect(wizard.steps).to.deep.equal(INITIAL_STEPS);
        wizard.setStep("configure-sync", EXPECTED_STEP_STATE);
        expect(wizard.steps).to.deep.equal(EXPECTED_WIZARD_STEPS);

        let activeStep = slot.assignedElements()[0];
        let emailEl = activeStep.shadowRoot.getElementById("email");

        expect(activeStep.state).to.deep.equal(EXPECTED_STEP_STATE);
        expect(activeStep.getAttribute("name")).to.equal("configure-sync");
        expect(emailEl.textContent).to.equal(MOCK_EMAIL);
      });

      it("should update data for 'active' steps", () => {
        const EXPECTED_WIZARD_STEPS = [
          { name: "sign-into-fxa", status: "active", label: "First label" },
          {
            name: "configure-sync",
            status: "unavailable",
            label: "Second label",
          },
          {
            name: "setup-new-device",
            status: "unavailable",
            label: "Third label",
          },
        ];
        const EXPECTED_STEP_STATE = { email: MOCK_EMAIL };

        expect(wizard.steps).to.deep.equal(INITIAL_STEPS);
        wizard.setStep("sign-into-fxa", EXPECTED_STEP_STATE);
        expect(wizard.steps).to.deep.equal(EXPECTED_WIZARD_STEPS);

        let activeStep = slot.assignedElements()[0];
        let emailEl = activeStep.shadowRoot.getElementById("email");

        expect(activeStep.state).to.deep.equal(EXPECTED_STEP_STATE);
        expect(activeStep.getAttribute("name")).to.equal("sign-into-fxa");
        expect(emailEl.textContent).to.equal(MOCK_EMAIL);

        const NEXT_MOCK_EMAIL = "foo@bar.com";
        wizard.setStep("sign-into-fxa", { email: NEXT_MOCK_EMAIL });
        expect(emailEl.textContent).to.equal(NEXT_MOCK_EMAIL);
      });

      it("should update data for 'done' steps without changing the 'active' step", () => {
        const EXPECTED_WIZARD_STEPS = [
          { name: "sign-into-fxa", status: "done", label: "First label" },
          { name: "configure-sync", status: "done", label: "Second label" },
          { name: "setup-new-device", status: "active", label: "Third label" },
        ];
        wizard.steps = EXPECTED_WIZARD_STEPS;
        wizard.setStep("configure-sync", EXPECTED_STEP_STATE);
        // We don't expect the <form-wizard> state to change, just the step state.
        expect(wizard.steps).to.deep.equal(EXPECTED_WIZARD_STEPS);

        let activeStep = slot.assignedElements()[0];
        expect(activeStep.getAttribute("name")).to.equal("setup-new-device");

        let doneStep = wizard
          .getRootNode()
          .querySelector("[name='configure-sync']");
        let emailEl = doneStep.shadowRoot.getElementById("email");
        expect(doneStep.state).to.deep.equal(EXPECTED_STEP_STATE);
        expect(emailEl.textContent).to.equal(MOCK_EMAIL);
      });
    });

    describe("fox doodle", () => {
      let featureFlagCheck;

      before(() => {
        featureFlagCheck = sinon.stub(global.window.waffle, "flag_is_active");
      });

      after(() => {
        featureFlagCheck.restore();
      });

      it("should show a doodle that changes when the active step changes", () => {
        featureFlagCheck.returns(true);
        renderWizard();

        let doodle = wizard.shadowRoot.getElementById("doodle");
        expect(doodle).to.exist;
        expect(doodle.hidden).to.be.false;
        expect(doodle.src.includes(signInDoodleURL)).to.be.true;

        wizard.activeStep = "configure-sync";
        expect(doodle.src.includes(configureDoodleURL)).to.be.true;

        wizard.activeStep = "setup-new-device";
        expect(doodle.src.includes(setupDoodleURL)).to.be.true;
      });

      it("should not show a doodle when the feature flag is not enabled", () => {
        featureFlagCheck.returns(false);
        renderWizard();

        let doodle = wizard.shadowRoot.getElementById("doodle");
        expect(doodle).to.exist;
        expect(doodle.hidden).to.be.true;

        wizard.activeStep = "configure-sync";
        expect(doodle.hidden).to.be.true;

        wizard.activeStep = "setup-new-device";
        expect(doodle.hidden).to.be.true;
      });
    });
  });

  describe("disqualification behavior", () => {
    it("should put the root into the disqualified state and populate the header/message", () => {
      wizard.disqualify("need-fx-desktop");

      let root = wizard.shadowRoot.querySelector(".form-wizard-root");
      expect(root.hasAttribute("inert")).to.be.true;

      let needFxDesktop = wizard.shadowRoot.querySelector(
        ".disqualification[reason='need-fx-desktop']"
      );
      expect(needFxDesktop.hasAttribute("active")).to.be.true;

      let uiTourBroken = wizard.shadowRoot.querySelector(
        ".disqualification[reason='uitour-broken']"
      );
      expect(uiTourBroken.hasAttribute("active")).to.be.false;

      wizard.disqualify("uitour-broken");
      expect(needFxDesktop.hasAttribute("active")).to.be.false;
      expect(uiTourBroken.hasAttribute("active")).to.be.true;
    });
  });
});
