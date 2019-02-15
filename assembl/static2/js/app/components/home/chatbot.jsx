// @flow
import React from 'react';
import { Translate } from 'react-redux-i18n';
import { Link } from 'react-router';
import { Grid, Row, Col } from 'react-bootstrap';

type ChatbotType = TitleEntries & {
  link: string,
  name: string
};

type Props = {
  locale: string,
  chatbot: ChatbotType
};

const Chatbot = ({ chatbot, locale }: Props) => (
  <section className="home-section contact-section">
    <Grid fluid>
      <div className="max-container center">
        <div className="margin-xl">
          <h1 className="dark-title-1 center">{chatbot.titleEntries[locale]}</h1>
        </div>
        <div className="center" style={{ margin: '60px 0' }}>
          <Row>
            <Col md={12}>
              <Link className="button-link button-dark" to={chatbot.link} target="_blank">
                <Translate value="home.chatbot" chatbotName={chatbot.name} />
              </Link>
            </Col>
          </Row>
        </div>
      </div>
    </Grid>
  </section>
);

export default Chatbot;