import React from 'react';
import { filter, forEach, map } from 'lodash';
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { t } from 'ttag';

import withStyles, { StylesProps } from '@components/core/withStyles';
import ScenarioResultRow from './ScenarioResultRow';
import { campaignScenarios, Scenario, completedScenario } from '../constants';
import CampaignSummaryComponent from '../CampaignSummaryComponent';
import { NavigationProps } from '@components/nav/types';
import { Campaign, ScenarioResult } from '@actions/types';
import { getCampaign, AppState } from '@reducers';
import typography from '@styles/typography';
import space from '@styles/space';
import COLORS from '@styles/colors';

export interface CampaignScenarioProps {
  id: number;
}

interface ReduxProps {
  campaign?: Campaign;
  cycleScenarios?: Scenario[];
  scenarioByCode?: { [code: string]: Scenario };
}

type Props = NavigationProps & CampaignScenarioProps & ReduxProps & StylesProps;

class CampaignScenarioView extends React.Component<Props> {
  _renderScenarioResult = (scenarioResult: ScenarioResult, idx: number) => {
    const {
      componentId,
      id,
      scenarioByCode,
    } = this.props;
    return (
      <ScenarioResultRow
        key={idx}
        componentId={componentId}
        campaignId={id}
        index={idx}
        scenarioResult={scenarioResult}
        scenarioByCode={scenarioByCode}
        editable
      />
    );
  };

  renderPendingScenario(scenario: Scenario, idx: number) {
    const { gameFont } = this.props;
    return (
      <Text style={[typography.gameFont, styles.disabled, { fontFamily: gameFont }]} key={idx}>
        { scenario.name }
      </Text>
    );
  }

  render() {
    const {
      campaign,
      cycleScenarios,
    } = this.props;
    if (!campaign) {
      return null;
    }
    const hasCompletedScenario = completedScenario(campaign.scenarioResults);
    return (
      <ScrollView style={[styles.container, space.paddingS]}>
        <CampaignSummaryComponent campaign={campaign} hideScenario />
        <Text style={typography.smallLabel}>
          { t`SCENARIOS` }
        </Text>
        { map(campaign.scenarioResults, this._renderScenarioResult) }
        { map(
          filter(cycleScenarios, scenario => !hasCompletedScenario(scenario)),
          (scenario, idx) => this.renderPendingScenario(scenario, idx))
        }
        <View style={styles.footer} />
      </ScrollView>
    );
  }
}

function mapStateToPropsFix(
  state: AppState,
  props: CampaignScenarioProps
): ReduxProps {
  const campaign = getCampaign(state, props.id);
  if (campaign) {
    const cycleScenarios = campaignScenarios(campaign.cycleCode);
    const scenarioByCode: { [code: string]: Scenario } = {};
    forEach(cycleScenarios, scenario => {
      scenarioByCode[scenario.code] = scenario;
    });
    return {
      campaign,
      cycleScenarios,
      scenarioByCode,
    };
  }
  return {};
}

export default connect(mapStateToPropsFix)(withStyles(CampaignScenarioView));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  disabled: {
    color: '#bdbdbd',
  },
  footer: {
    height: 50,
  },
});
