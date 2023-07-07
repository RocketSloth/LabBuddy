// 'profile.js'
import React, { useState, useEffect, useCallback } from 'react';
import { Auth, Typography, Button as AntButton } from "@supabase/ui";
import { Form, Input, Select } from "antd";
import styled from 'styled-components';
const { Text: AntText } = Typography;
const { Option } = Select;
import { supabase } from '../api';

const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin: 2rem auto;
  max-width: 500px;
`;

const Text = styled(AntText)`
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Button = styled(AntButton)`
  background-color: #036AB7;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 1rem;
`;

function Profile(props) {
    const { user } = Auth.useUser();
    const [age, setAge] = useState("");
    const [sex, setSex] = useState("");
    const [ethnicity, setEthnicity] = useState("");
    const [location, setLocation] = useState("");
    const [editing, setEditing] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (user && user.id) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select("*")
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setAge(data.age);
                    setSex(data.sex);
                    setEthnicity(data.ethnicity);
                    setLocation(data.location);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async () => fetchProfile()
        );

        return () => {
            authListener.unsubscribe();
        };
    }, [fetchProfile]);

    const handleSubmit = async () => {
        try {
            // Validate form data before submitting
            if (!age || !sex || !ethnicity || !location) {
                throw new Error('Please fill out all fields');
            }

            const { data, error } = await supabase
                .from('profiles')
                .upsert([
                  { user_id: user.id, age: age, sex: sex, ethnicity: ethnicity, location: location },
                ]);

            if (error) throw error;

            console.log('Profile saved successfully!');
            setEditing(false); // switch back to view mode after successful submit
        } catch (error) {
            console.error('Error inserting/updating profile: ', error);
        }
    }
    

    if (user)
      return (
        <Container>
          <Text>Signed in: {user.email}</Text>
          {editing ? (
            <Form onFinish={handleSubmit} className="profile-form">
              <FormItem label="Age" name="age">
                <Input value={age} onChange={(e) => setAge(e.target.value)} />
              </FormItem>
              <FormItem label="Sex" name="sex">
                <Select value={sex} onChange={(value) => setSex(value)}>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </FormItem>
              <FormItem label="Ethnicity" name="ethnicity">
                <Select value={ethnicity} onChange={(value) => setEthnicity(value)}>
                  <Option value="white">White</Option>
                  <Option value="asian">Asian</Option>
                  <Option value="black">Black</Option>
                  <Option value="hispanic">Hispanic</Option>
                  <Option value="native_american">Native American</Option>
                  <Option value="middle_eastern">Middle Eastern</Option>
                  <Option value="pacific_islander">Pacific Islander</Option>
                  <Option value="mixed">Mixed</Option>
                  <Option value="other">Other</Option>
                  // Add more options as needed
                </Select>
              </FormItem>
              <FormItem label="Location" name="location">
                <Select value={location} onChange={(value) => setLocation(value)}>
                  <Option value="us">US</Option>
                  <Option value="uk">UK</Option>
                  <Option value="canada">Canada</Option>
                  <Option value="mexico">Mexico</Option>
                  <Option value="australia">Australia</Option>
                  <Option value="india">India</Option>
                  <Option value="china">China</Option>
                  <Option value="brazil">Brazil</Option>
                  <Option value="south_africa">South Africa</Option>
                  <Option value="germany">Germany</Option>
                  <Option value="france">France</Option>
                  <Option value="italy">Italy</Option>
                  <Option value="spain">Spain</Option>
                  <Option value="japan">Japan</Option>
                  <Option value="russia">Russia</Option>
                  <Option value="other">Other</Option>
                  // Add more options as needed
                </Select>
              </FormItem>
              <FormItem className="button-container">
                <Button type="primary" htmlType="submit" block>Submit</Button>
                <Button block onClick={() => props.supabaseClient.auth.signOut()}>Sign out</Button>
              </FormItem>
            </Form>
          ) : (
            <>
              <Text>Age: {age}</Text>
              <Text>Sex: {sex}</Text>
              <Text>Ethnicity: {ethnicity}</Text>
              <Text>Location: {location}</Text>
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            </>
          )}
        </Container>
      );
    return props.children;
  }

  export default function AuthProfile() {
    return (
      <Auth.UserContextProvider supabaseClient={supabase}>
        <Profile supabaseClient={supabase}>
          <Auth supabaseClient={supabase} />
        </Profile>
      </Auth.UserContextProvider>
    )
  }
